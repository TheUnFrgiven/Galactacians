extends SceneTree

const Battle = preload("res://scripts/first_battle.gd")
var failures := 0

func check(value: bool, title: String) -> void:
	if not value:
		failures += 1
		push_error(title)
	else:
		print("PASS: ", title)

func simulate(team: Array[Dictionary]) -> RefCounted:
	var battle = Battle.new()
	battle.begin(team)
	for i: int in range(6000):
		battle.step(0.02)
		if battle.done:
			break
	return battle

func _initialize() -> void:
	run.call_deferred()

func run() -> void:
	var strong: Array[Dictionary] = [{"lane": 0, "col": 0, "x": 300.0, "power": 3}, {"lane": 2, "col": 0, "x": 300.0, "power": 3}]
	var battle = simulate(strong)
	check(battle.won and battle.hearts == 5, "two strong defenders win across threatened lanes")
	var weak: Array[Dictionary] = []
	for lane: int in [0, 2]:
		for col: int in range(3):
			weak.append({"lane": lane, "col": col, "x": 300.0 + col * 155, "power": 1})
	battle = simulate(weak)
	check(battle.won and battle.hearts == 5, "six weak defenders also win")
	var misplaced: Array[Dictionary] = [{"lane": 1, "col": 0, "x": 300.0, "power": 3}, {"lane": 1, "col": 1, "x": 455.0, "power": 3}]
	battle = simulate(misplaced)
	check(battle.done and not battle.won, "ignoring both entry lanes loses")
	var level = load("res://scenes/main.tscn").instantiate()
	root.add_child(level)
	await process_frame
	level.start_new()
	for i: int in range(3):
		level.tutorial_next()
	level.choose(3)
	level.answer = "99"
	level.submit()
	check(level.wrong and level.hinted and level.bucket.spent == 0, "first mistake teaches before awarding")
	level.save_game()
	level.resume_game()
	check(level.wrong and level.question_active, "resume preserves redemption and current question")
	level.answer = str(level.question.x + level.question.y)
	level.submit()
	check(level.pending == 1 and level.bucket.spent == 1 and level.evidence.is_empty(), "successful redemption still earns weakest reward")
	level.finish_answer()
	check(level.bucket.spent == 1, "repeated reward callback cannot duplicate tower")
	level.place(0, 0)
	level.choose(3)
	level.hint()
	level.answer = str(level.question.x + level.question.y)
	level.submit()
	check(level.pending == 3 and level.evidence.is_empty(), "voluntary hint preserves offered strength without independent credit")
	level.place(2, 0)
	level.choose(2)
	level.reveal()
	level.explain_next()
	level.explain_next()
	check(level.pending == 1 and level.bucket.remaining() == 1, "full explanation counts actual fallback power")
	level.place(0, 1)
	level.choose(1)
	level.answer = str(level.question.x + level.question.y)
	level.submit()
	level.place(2, 1)
	level.launch()
	check(level.screen == "battle", "full preparation launches combat")
	var count: int = level.formation.size()
	level.place(1, 4)
	check(level.formation.size() == count, "formation is locked during combat")
	level.retry()
	check(level.screen == "prepare" and level.formation.size() == count and level.bucket.remaining() == 0, "retry restores earned formation without new purchases")
	level.victory = true
	level.screen = "result"
	level.start_recovery()
	var spent: int = level.bucket.spent
	for i: int in range(5):
		if not level.recovery:
			break
		level.answer = str(level.question.x + level.question.y)
		level.submit()
	check(level.completed and level.victory and level.bucket.spent == spent, "targeted recovery completes learning without new towers or lost victory")
	level.start_new()
	for i: int in range(3):
		level.tutorial_next()
	for i: int in range(6):
		level.choose(1)
		level.answer = str(level.question.x + level.question.y)
		level.submit()
		level.place(0 if i < 3 else 2, i % 3)
	check(level.evidence.size() >= 3, "simple-question route can complete checks during preparation")
	level.loaded = JSON.parse_string(JSON.stringify(level.loaded))
	level.resume_game()
	check(level.formation.size() == 6 and level.bucket.remaining() == 0, "JSON round trip restores formation and full allowance")
	var click := InputEventMouseButton.new()
	click.button_index = MOUSE_BUTTON_LEFT
	click.pressed = true
	click.position = Vector2(300, 225)
	root.push_input(click, true)
	await process_frame
	check(level.selected == 0, "board mouse input selects the placed defender")
	level.start_new()
	level.modal = ""
	level.choose(1)
	var key := InputEventKey.new()
	key.pressed = true
	key.unicode = 50
	key.keycode = KEY_2
	Input.parse_input_event(key)
	await process_frame
	check(level.answer == "2", "physical keyboard enters the numeric answer")
	key = InputEventKey.new()
	key.pressed = true
	key.keycode = KEY_ENTER
	Input.parse_input_event(key)
	await process_frame
	check(level.pending == 1, "Enter checks answer and earns the tower")
	if "--screenshots" in OS.get_cmdline_user_args():
		level.screen = "menu"
		level.modal = ""
		level.build()
		await capture("menu")
		level.start_new()
		await capture("tutorial")
		for i: int in range(3):
			level.tutorial_next()
		await capture("board")
		level.choose(3)
		level.hint()
		await capture("question")
		level.modal = ""
		level.screen = "battle"
		level.battle.begin(strong)
		for i: int in range(300):
			level.battle.step(0.02)
		level.build()
		await capture("battle")
	level.queue_free()
	await process_frame
	print("First-level checks complete. Failures: ", failures)
	quit(1 if failures > 0 else 0)

func capture(name: String) -> void:
	await process_frame
	await process_frame
	await RenderingServer.frame_post_draw
	var path: String = "user://preview-" + name + ".png"
	root.get_texture().get_image().save_png(path)
	print("SCREENSHOT: ", ProjectSettings.globalize_path(path))
