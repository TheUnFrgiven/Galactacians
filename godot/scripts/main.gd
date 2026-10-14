extends Control
## Native menu foundation; mission integration is the next milestone.

var motion_enabled: bool = true
var elapsed: float = 0.0
var message: Label

func _ready() -> void:
	var center := CenterContainer.new()
	center.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(center)
	var column := VBoxContainer.new()
	column.custom_minimum_size = Vector2(380, 0)
	column.add_theme_constant_override("separation", 16)
	center.add_child(column)
	var title := Label.new()
	title.text = "Galactacians"
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.add_theme_color_override("font_color", Color("254d45"))
	title.add_theme_font_size_override("font_size", 48)
	column.add_child(title)
	var spacer := Control.new()
	spacer.custom_minimum_size.y = 200
	column.add_child(spacer)
	var play := Button.new()
	play.text = "Adventure"
	play.custom_minimum_size.y = 64
	play.add_theme_font_size_override("font_size", 28)
	play.pressed.connect(_show_milestone)
	column.add_child(play)
	var motion := CheckButton.new()
	motion.text = "Gentle animation"
	motion.button_pressed = true
	motion.custom_minimum_size.y = 48
	motion.toggled.connect(func(enabled: bool) -> void: motion_enabled = enabled)
	column.add_child(motion)
	message = Label.new()
	message.text = "Native preview · first mission in development"
	message.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	message.add_theme_color_override("font_color", Color("254d45"))
	column.add_child(message)
	play.grab_focus()

func _show_milestone() -> void:
	message.text = "Next: earn your team and defend Earth!"

func _process(delta: float) -> void:
	if motion_enabled:
		elapsed += delta
	queue_redraw()

func _draw() -> void:
	var earth := Vector2(size.x / 2.0, size.y / 2.0 - 20.0)
	if motion_enabled:
		earth.y += sin(elapsed * 1.5) * 7.0
	draw_circle(earth, 82.0, Color("b8dbb0"))
	draw_circle(earth, 72.0, Color("397976"))
	draw_circle(earth, 67.0, Color("78c9de"))
	draw_circle(earth + Vector2(-25, -25), 25.0, Color("92c96b"))
	draw_circle(earth + Vector2(29, 19), 30.0, Color("92c96b"))
	for x: float in [-20.0, 20.0]:
		draw_circle(earth + Vector2(x, 4), 5.0, Color("254d45"))
		draw_circle(earth + Vector2(x * 1.55, 17), 7.0, Color("efaca4"))
	draw_arc(earth + Vector2(0, 11), 15.0, 0.2, PI - 0.2, 24, Color("254d45"), 4.0, true)
