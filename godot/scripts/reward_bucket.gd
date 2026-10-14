class_name RewardBucket
extends RefCounted
## Pure preparation logic. Values are provisional units, not proven combat parity.

var capacity: int
var spent: int = 0
var resolved_questions: Dictionary = {}

func _init(power_capacity: int = 6) -> void:
	capacity = maxi(0, power_capacity)

func remaining() -> int:
	return capacity - spent

func can_offer(power: int) -> bool:
	return power > 0 and power <= remaining()

func award(question_id: String, offered_power: int, had_wrong_answer: bool,
		answer_revealed: bool, used_hint: bool) -> Dictionary:
	if question_id.is_empty() or resolved_questions.has(question_id) or not can_offer(offered_power):
		return {}
	var actual_power: int = 1 if had_wrong_answer or answer_revealed else offered_power
	var result: Dictionary = {
		"power": actual_power,
		"fallback": had_wrong_answer or answer_revealed,
		"independent": not (used_hint or had_wrong_answer or answer_revealed),
	}
	spent += actual_power
	resolved_questions[question_id] = result.duplicate(true)
	return result
