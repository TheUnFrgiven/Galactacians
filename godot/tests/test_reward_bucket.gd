extends SceneTree

const Bucket = preload("res://scripts/reward_bucket.gd")

func _init() -> void:
	var bucket := Bucket.new(6)
	var supported: Dictionary = bucket.award("hinted", 3, false, false, true)
	assert(supported.power == 3 and not supported.independent)
	assert(bucket.award("hinted", 3, false, false, false).is_empty())
	var fallback: Dictionary = bucket.award("retry", 3, true, false, false)
	assert(fallback.power == 1 and fallback.fallback)
	assert(bucket.remaining() == 2)
	assert(not bucket.can_offer(3))
	var revealed: Dictionary = bucket.award("revealed", 2, false, true, false)
	assert(revealed.power == 1 and not revealed.independent)
	var independent: Dictionary = bucket.award("last", 1, false, false, false)
	assert(independent.independent and bucket.remaining() == 0)
	assert(bucket.award("overflow", 1, false, false, false).is_empty())
	assert(Bucket.new(0).award("empty", 1, false, false, false).is_empty())
	print("PASS: supported rewards, fallback accounting, duplicate prevention, capacity")
	quit()
