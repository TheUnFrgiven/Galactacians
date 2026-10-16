extends SceneTree

const Content = preload("res://scripts/chapter.gd")
const Battle = preload("res://scripts/first_battle.gd")
var failures := 0

func check(value: bool, title: String) -> void:
	if value:
		print("PASS: ", title)
	else:
		failures += 1
		push_error(title)

func _initialize() -> void:
	run.call_deferred()

func run() -> void:
	var valid := true
	for m: int in range(6):
		for index: int in range(90):
			for strength: int in range(1, 4):
				var q: Dictionary = Content.question(m, index, strength)
				var result: int = Content.answer(q)
				valid = valid and result >= 0 and result <= Content.MISSIONS[m].max
				valid = valid and q.a <= Content.MISSIONS[m].max and q.b <= Content.MISSIONS[m].max
	check(valid, "1620 generated questions remain in each lesson's taught number range")
	var level = load("res://scenes/main.tscn").instantiate()
	root.add_child(level)
	await process_frame
	for m: int in range(6):
		level.start_mission(m)
		for i: int in range(3):
			level.tutorial_next()
		for w: int in range(int(Content.MISSIONS[m].waves)):
			var earned := 0
			while level.bucket.remaining() > 0:
				level.choose(1)
				level.answer = str(level.expected_answer())
				level.submit()
				var lane: int = (0 if earned < 3 else 2) if w == 0 else (1 if w == 1 else earned)
				var col: int = earned % 3 if w == 0 else earned if w == 1 else 3
				level.place(lane, col)
				earned += 1
				if earned > 6:
					break
			level.launch()
			for tick: int in range(10000):
				level.battle.step(0.02)
				if level.battle.done:
					break
			check(level.battle.won, "mission %d wave %d has a weak-crew winning formation" % [m + 1, w + 1])
			level._process(0)
			if not level.victory:
				break
		if level.victory and not level.learning_ready():
			level.start_recovery()
			for attempt: int in range(30):
				if not level.recovery:
					break
				level.answer = str(level.expected_answer())
				level.submit()
		check(level.cleared.has(m), "mission %d earns its persistent curriculum unlock" % [m + 1])
	check(level.cleared.size() == 6, "all six missions can be completed end to end")
	for m: int in range(6):
		var team: Array[Dictionary] = [{"lane": 0, "col": 0, "x": 300.0, "power": 3}, {"lane": 2, "col": 0, "x": 300.0, "power": 3}]
		var health := 5
		var success := true
		for w: int in range(int(Content.MISSIONS[m].waves)):
			if w > 0:
				team.append({"lane": 1 if w == 1 else 0, "col": 1, "x": 455.0, "power": 3})
			var simulation = Battle.new()
			simulation.begin(team, Content.recipe(m, w), health)
			for tick: int in range(10000):
				simulation.step(0.02)
				if simulation.done:
					break
			success = success and simulation.won
			health = simulation.hearts
			team = simulation.towers.filter(func(t: Dictionary) -> bool: return t.hp > 0)
		check(success, "mission %d also supports a smaller strong-crew route" % [m + 1])
	# Specialist properties should exist in combat, not only in descriptions.
	var wall = Battle.new()
	wall.begin([{"lane": 0, "x": 500.0, "power": 1, "role": "bricky"}])
	check(wall.towers[0].hp > 50, "Bricky astronaut has substantially stronger shielding")
	var frost = Battle.new()
	frost.begin([{"lane": 0, "x": 500.0, "power": 1, "role": "frost"}])
	for i: int in range(60):
		frost.step(0.02)
	check(not frost.enemies.is_empty() and frost.enemies[0].slow > 0, "Frost astronaut actually slows a visitor")
	var splash = Battle.new()
	splash.begin([{"lane": 0, "x": 500.0, "power": 1, "role": "poppy"}], [{"at": 0.0, "lane": 0, "kind": "swarm"}, {"at": 0.0, "lane": 0, "kind": "swarm"}])
	splash.step(0.2)
	check(splash.enemies[0].hp < 19 and splash.enemies[1].hp < 19, "Poppy damages both members of a cluster")
	var piercer = Battle.new()
	piercer.begin([{"lane": 0, "x": 500.0, "power": 1, "role": "prism"}], [{"at": 0.0, "lane": 0, "kind": "tank"}])
	piercer.step(0.2)
	check(is_equal_approx(piercer.enemies[0].hp, 70.0 - 9.0 * 2.3), "Prism damage ignores helmet armor")
	if "--screenshots" in OS.get_cmdline_user_args():
		level.open_path()
		await capture("chapter-path")
		level.start_mission(5)
		level.modal = ""
		level.formation.assign([
			{"lane": 0, "col": 0, "x": 300.0, "power": 1, "role": "pebble"},
			{"lane": 0, "col": 1, "x": 455.0, "power": 1, "role": "bricky"},
			{"lane": 1, "col": 0, "x": 300.0, "power": 1, "role": "frost"},
			{"lane": 2, "col": 0, "x": 300.0, "power": 1, "role": "poppy"},
			{"lane": 2, "col": 1, "x": 455.0, "power": 1, "role": "prism"}])
		level.build()
		await capture("astronaut-crew")
		level.start_mission(3)
		level.tutorial = 2
		level.build()
		await capture("subtraction-lesson")
	level.queue_free()
	await process_frame
	print("Chapter failures: ", failures)
	quit(1 if failures else 0)

func capture(name: String) -> void:
	await process_frame
	await process_frame
	await RenderingServer.frame_post_draw
	var path: String = "user://preview-" + name + ".png"
	root.get_texture().get_image().save_png(path)
	print(ProjectSettings.globalize_path(path))
