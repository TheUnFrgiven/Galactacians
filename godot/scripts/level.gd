extends Control

const Battle = preload("res://scripts/first_battle.gd")
const Bucket = preload("res://scripts/reward_bucket.gd")
const FONT = preload("res://friendly_font.tres")
const INK := Color("294e48")
const SAVE_PATH := "user://first-contact-v1.json"
const FACTS: Array[Vector2i] = [Vector2i(1, 1), Vector2i(1, 2), Vector2i(1, 3), Vector2i(2, 2), Vector2i(3, 1), Vector2i(2, 1), Vector2i(3, 2), Vector2i(2, 3)]
var ui: Control
var screen := "menu"
var modal := ""
var time := 0.0
var motion := true
var bucket = Bucket.new(6)
var battle = Battle.new()
var formation: Array[Dictionary] = []
var checkpoint: Array[Dictionary] = []
var selected := -1
var pending := 0
var index := 0
var question := Vector2i(1, 1)
var power := 1
var answer := ""
var answer_label: Label
var feedback := ""
var wrong := false
var hinted := false
var revealed := false
var joined := false
var evidence: Array[String] = []
var records: Array = []
var victory := false
var completed := false
var recovery := false
var tutorial := 0
var speed := 1.0
var loaded: Dictionary = {}
var question_active := false

func _ready() -> void:
	if FileAccess.file_exists(SAVE_PATH):
		var parsed: Variant = JSON.parse_string(FileAccess.get_file_as_string(SAVE_PATH))
		if parsed is Dictionary and parsed.get("version") == 1:
			loaded = parsed
			motion = bool(loaded.get("motion", true))
			completed = bool(loaded.get("completed", false))
	ui = Control.new()
	ui.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	ui.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(ui)
	build()
	if "--level" in OS.get_cmdline_user_args():
		start_new()

func _process(delta: float) -> void:
	if motion:
		time += delta
	if screen == "battle" and modal.is_empty():
		var remaining: float = minf(delta, 0.2) * speed
		while remaining > 0:
			var step: float = minf(remaining, 0.02)
			battle.step(step)
			remaining -= step
		if battle.done:
			victory = battle.won
			completed = completed or (victory and evidence.size() >= 3)
			screen = "result"
			save_game()
			build()
	queue_redraw()

func label(text: String, rect: Rect2, fs: int = 24, color: Color = INK, center: bool = false) -> Label:
	var node := Label.new()
	node.text = text
	node.position = rect.position
	node.size = rect.size
	node.add_theme_font_override("font", FONT)
	node.add_theme_font_size_override("font_size", fs)
	node.add_theme_color_override("font_color", color)
	node.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	node.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	if center:
		node.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	node.mouse_filter = Control.MOUSE_FILTER_IGNORE
	ui.add_child(node)
	return node

func button(text: String, rect: Rect2, action: Callable, color: Color = Color("a9d782"), fs: int = 23) -> Button:
	var node := Button.new()
	node.text = text
	node.position = rect.position
	node.size = rect.size
	node.add_theme_font_override("font", FONT)
	node.add_theme_font_size_override("font_size", fs)
	node.add_theme_color_override("font_color", INK)
	node.add_theme_color_override("font_hover_color", INK)
	node.add_theme_color_override("font_pressed_color", INK)
	for state: String in ["normal", "hover", "pressed", "focus"]:
		var box := StyleBoxFlat.new()
		box.bg_color = color.lightened(0.12) if state == "hover" else color
		box.set_corner_radius_all(18)
		box.border_width_bottom = 4 if state != "pressed" else 1
		box.border_color = color.darkened(0.18)
		if state == "focus":
			box.bg_color = Color.TRANSPARENT
			box.set_border_width_all(3)
			box.border_color = Color("567cc1")
		node.add_theme_stylebox_override(state, box)
	node.pressed.connect(action)
	ui.add_child(node)
	return node

func build() -> void:
	for child: Node in ui.get_children():
		ui.remove_child(child)
		child.queue_free()
	if screen == "menu":
		label("EARTH ORBIT", Rect2(700, 120, 440, 35), 19, Color("699469"), true)
		label("Small friends.\nBig adventure.", Rect2(680, 165, 480, 150), 50, INK, true)
		label("First contact", Rect2(720, 324, 400, 40), 26, INK, true)
		button("Play first level  →", Rect2(740, 395, 360, 70), start_new)
		if not loaded.is_empty():
			button("Continue", Rect2(740, 480, 360, 56), resume_game, Color("dce9c9"))
		button("Settings", Rect2(1090, 28, 160, 48), open_settings, Color("edf0df"), 19)
		label("GALACTACIANS", Rect2(80, 600, 500, 55), 28, INK, true)
	else:
		button("‹  Menu", Rect2(30, 23, 125, 48), open_settings, Color.WHITE, 20)
		label("First contact", Rect2(180, 18, 520, 55), 32)
		label("EARTH ORBIT   /   01", Rect2(183, 69, 450, 25), 15, Color("718f7d"))
		var count: int = battle.hearts if screen in ["battle", "result"] else 5
		label("♥ ".repeat(count) + "♡ ".repeat(5 - count), Rect2(960, 25, 280, 50), 32, Color("d97786"), true)
		if screen == "prepare":
			prepare_ui()
		elif screen == "battle":
			label("Here they come!", Rect2(60, 564, 700, 55), 30)
			label("Your team has this. Watch Earth’s lanes.", Rect2(60, 620, 800, 40), 21)
			button("%s× speed" % str(speed), Rect2(1030, 600, 190, 58), func() -> void: speed = 2.0 if speed == 1.0 else 1.0; build(), Color("dce9c9"), 21)
	if not modal.is_empty() or screen == "result":
		var shade := ColorRect.new()
		shade.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
		shade.color = Color(0.12, 0.24, 0.22, 0.36)
		ui.add_child(shade)
		var panel := Panel.new()
		panel.position = Vector2(315, 58)
		panel.size = Vector2(650, 610)
		var style := StyleBoxFlat.new()
		style.bg_color = Color("fffdf2")
		style.set_corner_radius_all(30)
		style.shadow_color = Color(0.1, 0.2, 0.15, 0.18)
		style.shadow_size = 18
		panel.add_theme_stylebox_override("panel", style)
		ui.add_child(panel)
		if modal == "tutorial":
			tutorial_ui()
		elif modal == "question":
			question_ui()
		elif modal == "settings":
			settings_ui()
		elif screen == "result":
			result_ui()
	queue_redraw()

func prepare_ui() -> void:
	if question_active:
		label("Your question is waiting", Rect2(60, 556, 800, 55), 30)
		button("Back to question", Rect2(890, 595, 320, 65), func() -> void: modal = "question"; build())
	elif pending > 0:
		label("Pebble joined! Tap a landing pad.", Rect2(60, 556, 850, 55), 30)
		label("Aliens will visit the top and bottom lanes.", Rect2(60, 615, 1000, 40), 22)
	elif selected >= 0:
		label("Tap an empty pad to move Pebble.", Rect2(60, 560, 900, 60), 28)
		button("Done", Rect2(1040, 600, 175, 60), func() -> void: selected = -1; build())
	elif bucket.remaining() > 0:
		label("Choose your next friend", Rect2(60, 542, 900, 45), 27)
		for strength: int in range(1, mini(3, bucket.remaining()) + 1):
			var prompt: Vector2i = offer_fact(strength)
			button("Pebble %s    %d + %d" % ["●".repeat(strength), prompt.x, prompt.y], Rect2(60 + (strength - 1) * 340, 600, 320, 66), choose.bind(strength), Color("d8edbc"), 23)
		button("?", Rect2(1160, 604, 56, 56), func() -> void: tutorial = 0; modal = "tutorial"; build(), Color("e4dff3"))
	else:
		label("Team ready!", Rect2(60, 554, 700, 50), 32)
		label("Tap a friend to move them. Cover the marked lanes.", Rect2(60, 612, 900, 45), 22)
		button("Ready  ▶", Rect2(1020, 594, 200, 72), launch)

func teaching_art(a: int, b: int, rect: Rect2, combine: bool) -> void:
	var art := TeachingArt.new()
	art.position = rect.position
	art.size = rect.size
	art.a = a
	art.b = b
	art.joined = combine
	art.moving = motion
	ui.add_child(art)

func tutorial_ui() -> void:
	label("Hello, Earth defender!" if tutorial == 0 else "Two groups. One happy team.", Rect2(350, 85, 580, 65), 32, INK, true)
	label("Answer a little sum to meet Pebble.\nThen place your friend in a lane." if tutorial == 0 else "Two friends meet one more.\nTap to bring them together.", Rect2(370, 158, 540, 85), 24, INK, true)
	teaching_art(2, 1, Rect2(365, 260, 550, 190), tutorial >= 2)
	if tutorial >= 2:
		label("2 + 1 = 3", Rect2(360, 450, 560, 70), 42, INK, true)
		label("More dots on a Pebble means a stronger friend.", Rect2(355, 515, 570, 32), 18, INK, true)
	button("Meet Pebble" if tutorial == 0 else ("Bring them together" if tutorial == 1 else "My turn!"), Rect2(440, 555, 400, 65), tutorial_next)

func tutorial_next() -> void:
	tutorial += 1
	if tutorial > 2:
		modal = ""
		save_game()
	build()

func question_ui() -> void:
	label("Let’s practise" if recovery else "A new Pebble friend", Rect2(350, 76, 580, 45), 26, INK, true)
	label("%d + %d = %s" % [question.x, question.y, str(question.x + question.y) if revealed else "?"], Rect2(350, 120, 580, 70), 48, INK, true)
	if hinted or revealed:
		teaching_art(question.x, question.y, Rect2(380, 195, 520, 125), joined)
		label(feedback, Rect2(350, 319, 580, 65), 21, INK, true)
	else:
		label("How many altogether?", Rect2(350, 200, 580, 50), 24, INK, true)
		label(feedback, Rect2(350, 255, 580, 50), 21, INK, true)
	if revealed:
		button("Bring the groups together" if not joined else "Pebble joins us" if not recovery else "Try a fresh question", Rect2(390, 495, 500, 68), explain_next)
		return
	answer_label = label(answer if not answer.is_empty() else "_", Rect2(390, 390, 125, 80), 44, INK, true)
	for digit: int in range(10):
		button(str(digit), Rect2(535 + (digit % 5) * 72, 394 + floori(digit / 5.0) * 66, 62, 56), enter_digit.bind(str(digit)), Color("eef1df"), 26)
	button("⌫", Rect2(395, 477, 110, 54), erase, Color("eef1df"), 25)
	button("Check", Rect2(535, 540, 350, 58), submit)
	button("Hint", Rect2(360, 607, 130, 40), hint, Color("e7e1f4"), 18)
	button("Show me", Rect2(510, 607, 160, 40), reveal, Color("e7e1f4"), 18)
	button("Look at board", Rect2(700, 607, 220, 40), func() -> void: modal = ""; build(), Color("eef1df"), 18)

func open_settings() -> void:
	modal = "settings"
	build()

func settings_ui() -> void:
	label("Take a little breather", Rect2(350, 95, 580, 70), 34, INK, true)
	button("Animation: " + ("on" if motion else "less motion"), Rect2(410, 220, 460, 65), func() -> void: motion = not motion; save_game(); build(), Color("dce9c9"))
	label("Your team will wait for you.", Rect2(365, 330, 550, 60), 24, INK, true)
	button("Back to game", Rect2(410, 440, 460, 64), func() -> void: modal = "question" if question_active else ""; build())
	button("Save & home", Rect2(410, 525, 460, 58), go_home, Color("eef1df"))

func go_home() -> void:
	modal = "question" if question_active else ""
	save_game()
	screen = "menu"
	modal = ""
	build()

func result_ui() -> void:
	label("Earth says thank you!" if victory else "Let’s try a new plan", Rect2(350, 105, 580, 70), 36, INK, true)
	label("You sent the visitors home." if victory else "Your friends are ready to try again.\nMove them into the marked lanes.", Rect2(365, 195, 550, 90), 25, INK, true)
	label("★  ★  ★" if victory else "♡", Rect2(350, 300, 580, 90), 65, Color("d7a947"), true)
	if victory:
		label("First contact complete!" if evidence.size() >= 3 else "Battle won! Let’s practise a little more together.", Rect2(350, 400, 580, 60), 23, INK, true)
		button("Play again" if evidence.size() >= 3 else "A little practice", Rect2(410, 490, 460, 65), start_new if evidence.size() >= 3 else start_recovery)
	else:
		button("Rearrange & retry", Rect2(410, 490, 460, 65), retry)
	button("Home", Rect2(490, 580, 300, 48), go_home, Color("eef1df"), 20)

func offer_fact(strength: int) -> Vector2i:
	var offset: int = 0 if strength == 1 else 3 if strength == 2 else 6
	var count: int = 3 if strength == 1 else 3 if strength == 2 else 2
	return FACTS[offset + index % count]

func start_new() -> void:
	bucket = Bucket.new(6)
	formation.clear()
	checkpoint.clear()
	evidence.clear()
	records.clear()
	pending = 0
	selected = -1
	index = 0
	victory = false
	recovery = false
	question_active = false
	screen = "prepare"
	modal = "tutorial"
	tutorial = 0
	save_game()
	build()

func choose(strength: int) -> void:
	if not bucket.can_offer(strength) or pending > 0 or question_active:
		return
	question = offer_fact(strength)
	power = strength
	reset_question()

func reset_question() -> void:
	answer = ""
	wrong = false
	hinted = false
	revealed = false
	joined = false
	feedback = ""
	question_active = true
	modal = "question"
	save_game()
	build()

func enter_digit(digit: String) -> void:
	if answer.length() < 2:
		answer += digit
		answer_label.text = answer

func erase() -> void:
	answer = answer.left(-1)
	answer_label.text = answer if not answer.is_empty() else "_"

func _input(event: InputEvent) -> void:
	if modal != "question" or revealed or not event is InputEventKey or not event.pressed or event.echo:
		return
	var key: InputEventKey = event as InputEventKey
	if key.keycode == KEY_ENTER or key.keycode == KEY_KP_ENTER:
		submit()
	elif key.keycode == KEY_BACKSPACE:
		erase()
	elif key.unicode >= 48 and key.unicode <= 57:
		enter_digit(String.chr(key.unicode))
	get_viewport().set_input_as_handled()

func hint() -> void:
	hinted = true
	feedback = "Count the first group. Then count on %d more." % question.y
	save_game()
	build()

func reveal() -> void:
	revealed = true
	hinted = true
	joined = false
	feedback = "%d friends here. %d more are coming to join." % [question.x, question.y]
	save_game()
	build()

func explain_next() -> void:
	if not joined:
		joined = true
		feedback = "%d and %d together make %d friends." % [question.x, question.y, question.x + question.y]
		save_game()
		build()
	else:
		finish_answer()

func submit() -> void:
	if answer.is_empty() or not question_active or revealed:
		return
	if answer.to_int() == question.x + question.y:
		finish_answer()
	elif not wrong:
		wrong = true
		answer = ""
		hint()
		feedback = "Let’s count together, then try once more."
		build()
	else:
		reveal()

func finish_answer() -> void:
	if not question_active:
		return
	var independent: bool = not (hinted or wrong or revealed)
	var fact: String = "%d+%d" % [question.x, question.y]
	if not recovery:
		var reward: Dictionary = bucket.award("q%d" % index, power, wrong, revealed, hinted)
		if reward.is_empty():
			return
		pending = int(reward.power)
	if independent and not evidence.has(fact) and fact != "2+1":
		# The exact worked tutorial example is not fresh independent evidence.
		evidence.append(fact)
	records.append({"fact": fact, "hinted": hinted, "wrong": wrong, "revealed": revealed, "independent": independent})
	question_active = false
	index += 1
	modal = ""
	if recovery:
		if evidence.size() >= 3:
			completed = true
			recovery = false
			screen = "result"
		else:
			next_recovery()
			return
	save_game()
	build()

func start_recovery() -> void:
	recovery = true
	next_recovery()

func next_recovery() -> void:
	for i: int in range(FACTS.size()):
		var candidate: Vector2i = FACTS[(index + i) % FACTS.size()]
		var fact: String = "%d+%d" % [candidate.x, candidate.y]
		if not evidence.has(fact) and fact != "2+1":
			question = candidate
			break
	reset_question()

func _gui_input(event: InputEvent) -> void:
	if screen != "prepare" or not modal.is_empty() or question_active:
		return
	if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		for lane: int in range(3):
			for col: int in range(5):
				if event.position.distance_to(Vector2(300 + col * 155, 225 + lane * 122)) < 48:
					place(lane, col)

func place(lane: int, col: int) -> void:
	if screen != "prepare" or question_active or lane < 0 or lane > 2 or col < 0 or col > 4:
		return
	for i: int in range(formation.size()):
		if formation[i].lane == lane and formation[i].col == col:
			if pending == 0:
				selected = i
				build()
			return
	if pending > 0:
		formation.append({"lane": lane, "col": col, "x": 300.0 + col * 155, "power": pending})
		pending = 0
	elif selected >= 0:
		formation[selected].lane = lane
		formation[selected].col = col
		formation[selected].x = 300.0 + col * 155
		selected = -1
	save_game()
	build()

func launch() -> void:
	if bucket.remaining() != 0 or pending > 0 or question_active:
		return
	checkpoint = formation.duplicate(true)
	battle.begin(checkpoint)
	screen = "battle"
	selected = -1
	save_game()
	build()

func retry() -> void:
	formation = checkpoint.duplicate(true)
	pending = 0
	selected = -1
	screen = "prepare"
	modal = ""
	save_game()
	build()

func save_game() -> void:
	if screen == "menu":
		loaded["motion"] = motion
		if not loaded.is_empty() and loaded.has("version") and not "--test" in OS.get_cmdline_user_args():
			var settings_file := FileAccess.open(SAVE_PATH, FileAccess.WRITE)
			if settings_file:
				settings_file.store_string(JSON.stringify(loaded))
		return
	var state: Dictionary = {"version": 1, "screen": screen, "modal": modal,
		"formation": formation, "checkpoint": checkpoint, "spent": bucket.spent,
		"resolved": bucket.resolved_questions, "pending": pending, "index": index,
		"evidence": evidence, "records": records, "victory": victory, "completed": completed,
		"recovery": recovery, "motion": motion, "tutorial": tutorial,
		"question": [question.x, question.y], "power": power, "question_active": question_active,
		"wrong": wrong, "hinted": hinted, "revealed": revealed, "joined": joined, "feedback": feedback,
		"hearts": battle.hearts}
	loaded = state.duplicate(true)
	if "--test" in OS.get_cmdline_user_args():
		return
	var file := FileAccess.open(SAVE_PATH, FileAccess.WRITE)
	if file:
		file.store_string(JSON.stringify(state))
		loaded = state.duplicate(true)

func resume_game() -> void:
	if loaded.is_empty():
		start_new()
		return
	bucket = Bucket.new(6)
	bucket.spent = clampi(int(loaded.get("spent", 0)), 0, 6)
	bucket.resolved_questions = loaded.get("resolved", {}).duplicate(true)
	formation.assign(loaded.get("formation", []))
	checkpoint.assign(loaded.get("checkpoint", []))
	evidence.assign(loaded.get("evidence", []))
	records = loaded.get("records", []).duplicate(true)
	pending = int(loaded.get("pending", 0))
	index = int(loaded.get("index", 0))
	victory = bool(loaded.get("victory", false))
	battle.hearts = int(loaded.get("hearts", 5))
	recovery = bool(loaded.get("recovery", false))
	screen = str(loaded.get("screen", "prepare"))
	modal = str(loaded.get("modal", ""))
	if screen == "battle":
		screen = "prepare"
		formation = checkpoint.duplicate(true)
	if modal == "settings":
		modal = ""
	tutorial = int(loaded.get("tutorial", 0))
	var pair: Array = loaded.get("question", [1, 1])
	question = Vector2i(int(pair[0]), int(pair[1]))
	power = int(loaded.get("power", 1))
	question_active = bool(loaded.get("question_active", false))
	wrong = bool(loaded.get("wrong", false))
	hinted = bool(loaded.get("hinted", false))
	revealed = bool(loaded.get("revealed", false))
	joined = bool(loaded.get("joined", false))
	feedback = str(loaded.get("feedback", ""))
	answer = ""
	selected = -1
	if question_active:
		modal = "question"
	build()

func _draw() -> void:
	draw_rect(Rect2(Vector2.ZERO, size), Color("f4f5e9"))
	if screen == "menu":
		draw_circle(Vector2(320, 340), 270, Color("e2ebd2"))
		draw_arc(Vector2(320, 340), 220, 0, TAU, 100, Color("cbdcba"), 2, true)
		earth(Vector2(320, 335), 135, false)
		alien(Vector2(490, 160), 1.3, 0)
		alien(Vector2(140, 490), 0.9, 2)
		return
	rounded(Rect2(30, 125, 1220, 410), Color("d4e4c8"), 28)
	for lane: int in range(3):
		var y: float = 171 + lane * 122
		rounded(Rect2(215, y, 1008, 108), Color("edf3de") if lane != 1 else Color("e4edda"), 25)
		if lane != 1:
			draw_circle(Vector2(1173, y + 54), 25, Color("d6dfbc"))
			draw_string(FONT, Vector2(1155, y + 65), "←", HORIZONTAL_ALIGNMENT_LEFT, -1, 34, Color("79916b"))
		elif screen == "prepare":
			draw_string(FONT, Vector2(1070, y + 60), "quiet lane", HORIZONTAL_ALIGNMENT_LEFT, -1, 16, Color("81977b"))
		for col: int in range(5):
			var p := Vector2(300 + col * 155, 225 + lane * 122)
			if screen == "prepare":
				draw_circle(p, 29, Color("dce8cc"))
				draw_arc(p, 29, 0, TAU, 40, Color("c1d5b0"), 2, true)
				draw_string(FONT, p + Vector2(-7, 8), "+", HORIZONTAL_ALIGNMENT_LEFT, -1, 24, Color("a8bd96"))
	if selected >= 0 and selected < formation.size() and screen == "prepare":
		var tower: Dictionary = formation[selected]
		rounded(Rect2(tower.x, 181 + tower.lane * 122, minf(700, 1200 - tower.x), 87), Color(0.5, 0.75, 0.88, 0.23), 18)
	earth(Vector2(124, 342), 73, screen == "battle" and battle.worried())
	draw_string(FONT, Vector2(93, 453), "HOME", HORIZONTAL_ALIGNMENT_LEFT, -1, 18, Color("718e66"))
	var active: Array[Dictionary] = battle.towers if screen == "battle" else formation
	for tower: Dictionary in active:
		if tower.get("hp", 1) > 0:
			pebble(Vector2(tower.x, 225 + tower.lane * 122), int(tower.power))
	if screen == "battle":
		for enemy: Dictionary in battle.enemies:
			alien(Vector2(enemy.x, 225 + enemy.lane * 122), 0.8, enemy.phase)
			if enemy.hit > 0:
				draw_arc(Vector2(enemy.x, 225 + enemy.lane * 122), 34, 0, TAU, 24, Color("ffe5a1"), 4, true)
		for shot: Dictionary in battle.shots:
			var bullet: Vector2 = shot.from.lerp(shot.to, clampf(1.0 - shot.life / 0.16, 0.0, 1.0))
			draw_line(bullet - Vector2(20, 0), bullet, Color("e5b34f"), 4, true)
			draw_circle(bullet, 6, Color("f8cb68"))
	rounded(Rect2(30, 545, 1220, 150), Color.WHITE, 24)

func rounded(rect: Rect2, color: Color, radius: int) -> void:
	var box := StyleBoxFlat.new()
	box.bg_color = color
	box.set_corner_radius_all(radius)
	draw_style_box(box, rect)

func earth(center: Vector2, radius: float, worried: bool) -> void:
	var p: Vector2 = center + Vector2(0, sin(time * 1.3) * 5 if motion else 0)
	draw_circle(p, radius + 10, Color("bfdab3"))
	draw_circle(p, radius + 3, Color("528d85"))
	draw_circle(p, radius, Color("85cddd"))
	var land := PackedVector2Array([Vector2(-0.7, -0.4), Vector2(-0.3, -0.75), Vector2(0.0, -0.66), Vector2(0.12, -0.35), Vector2(-0.1, -0.2), Vector2(-0.03, 0.1), Vector2(-0.26, 0.34), Vector2(-0.48, 0.14), Vector2(-0.43, -0.12)])
	var coast := PackedVector2Array([Vector2(0.25, 0.03), Vector2(0.52, -0.1), Vector2(0.76, 0.1), Vector2(0.65, 0.41), Vector2(0.34, 0.7), Vector2(0.15, 0.49)])
	for polygon: PackedVector2Array in [land, coast]:
		var points := PackedVector2Array()
		for point: Vector2 in polygon:
			points.append(p + point.rotated(time * 0.07) * radius)
		draw_colored_polygon(points, Color("92c871"))
	for x: float in [-0.26, 0.26]:
		draw_circle(p + Vector2(radius * x, 2), radius * 0.065, INK)
		draw_circle(p + Vector2(radius * x * 1.6, radius * 0.17), radius * 0.09, Color("efa7a0"))
	if worried:
		draw_arc(p + Vector2(0, radius * 0.4), radius * 0.17, PI + 0.2, TAU - 0.2, 20, INK, 4, true)
		draw_line(p + Vector2(-28, -20), p + Vector2(-13, -26), INK, 3, true)
		draw_line(p + Vector2(13, -26), p + Vector2(28, -20), INK, 3, true)
	else:
		draw_arc(p + Vector2(0, radius * 0.15), radius * 0.18, 0.2, PI - 0.2, 20, INK, 4, true)

func pebble(p: Vector2, strength: int) -> void:
	var r: float = 24 + strength * 3
	draw_circle(p + Vector2(0, 10), r + 5, Color("b6cba3"))
	draw_circle(p, r + 2, INK)
	draw_circle(p, r, Color("8dcb78"))
	draw_arc(p + Vector2(-6, -5), r * 0.6, PI, PI * 1.5, 12, Color("c7eab1"), 5, true)
	for x: int in [-9, 9]:
		draw_circle(p + Vector2(x, -1), 3.5, INK)
	draw_arc(p + Vector2(0, 5), 7, 0.1, PI - 0.1, 12, INK, 2, true)
	for i: int in range(strength):
		draw_circle(p + Vector2((i - (strength - 1) / 2.0) * 10, 44), 3, Color("c8a249"))

func alien(center: Vector2, scale_value: float, phase: float) -> void:
	var p: Vector2 = center + Vector2(0, sin(time * 2.3 + phase) * 6 if motion else 0)
	draw_set_transform(p, sin(time + phase) * 0.04 if motion else 0, Vector2.ONE * scale_value)
	draw_circle(Vector2(0, -8), 27, Color("9b88be"))
	draw_circle(Vector2(0, -10), 24, Color("c9b7e3"))
	for x: int in [-10, 10]:
		draw_circle(Vector2(x, -10), 4, INK)
		draw_line(Vector2(x, -30), Vector2(x * 1.5, -40), INK, 2, true)
		draw_circle(Vector2(x * 1.5, -40), 4, Color("d8b768"))
	draw_arc(Vector2(0, -2), 6, 0, PI, 12, INK, 2, true)
	ellipse(Vector2(0, 15), Vector2(40, 13), Color("827ea7"))
	ellipse(Vector2(0, 11), Vector2(39, 12), Color("c1b8dc"))
	for x: int in [-23, 0, 23]:
		draw_circle(Vector2(x, 12), 3, Color("fff1ba"))
	draw_set_transform(Vector2.ZERO)

func ellipse(center: Vector2, radii: Vector2, color: Color) -> void:
	var points := PackedVector2Array()
	for i: int in range(40):
		var angle: float = TAU * i / 40.0
		points.append(center + Vector2(cos(angle), sin(angle)) * radii)
	draw_colored_polygon(points, color)

class TeachingArt extends Control:
	var a := 2
	var b := 1
	var joined := false
	var moving := true
	var progress := 0.0
	func _ready() -> void:
		mouse_filter = Control.MOUSE_FILTER_IGNORE
	func _process(dt: float) -> void:
		progress = minf(1, progress + dt * 1.5) if moving else 1.0
		queue_redraw()
	func _draw() -> void:
		for i: int in range(a + b):
			var start := Vector2(55 + i * 75 + (60 if i >= a else 0), size.y * 0.5)
			var target := Vector2(size.x * 0.5 + (i - (a + b - 1) / 2.0) * 65, size.y * 0.5)
			var p: Vector2 = start.lerp(target, progress) if joined else start
			draw_circle(p, 25, Color("9fce84") if i < a else Color("b7a3d7"))
			for x: int in [-7, 7]:
				draw_circle(p + Vector2(x, -3), 3, Color("294e48"))
			draw_arc(p + Vector2(0, 3), 6, 0, PI, 12, Color("294e48"), 2, true)
