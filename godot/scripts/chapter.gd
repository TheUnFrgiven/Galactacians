class_name Chapter
extends RefCounted

const ROLES: Array[String] = ["pebble", "bricky", "frost", "poppy", "prism"]
const NAMES: Dictionary = {"pebble": "Pebble", "bricky": "Bricky", "frost": "Frost", "poppy": "Poppy", "prism": "Prism"}
const JOBS: Dictionary = {"pebble": "Steady shots", "bricky": "Shields the crew", "frost": "Slows visitors", "poppy": "Clears groups", "prism": "Pierces armor"}
const MISSIONS: Array[Dictionary] = [
	{"name": "First contact", "topic": "Put little groups together", "waves": 1, "roles": 1, "op": "+", "a": 2, "b": 1, "max": 5, "new": "pebble"},
	{"name": "One more visitor", "topic": "Count on one or two", "waves": 2, "roles": 2, "op": "+", "a": 4, "b": 2, "max": 10, "new": "bricky"},
	{"name": "Moon mail", "topic": "Add groups within ten", "waves": 2, "roles": 3, "op": "+", "a": 4, "b": 3, "max": 10, "new": "frost"},
	{"name": "Heading home", "topic": "Find who stays behind", "waves": 2, "roles": 3, "op": "−", "a": 5, "b": 2, "max": 5, "new": ""},
	{"name": "Empty spaces", "topic": "Take away within ten", "waves": 2, "roles": 4, "op": "−", "a": 7, "b": 3, "max": 10, "new": "poppy"},
	{"name": "Captain welcome", "topic": "Join, leave, and choose", "waves": 3, "roles": 5, "op": "+", "a": 3, "b": 2, "max": 10, "new": "prism"},
]

static func answer(q: Dictionary) -> int:
	return int(q.a) + int(q.b) if q.op == "+" else int(q.a) - int(q.b)

static func question(mission: int, index: int, strength: int) -> Dictionary:
	var op: String = str(MISSIONS[mission].op)
	if mission == 5:
		op = "+" if index % 2 == 0 else "−"
	var a: int
	var b: int
	if mission == 0:
		var pools: Array = [[[1, 1], [1, 2], [1, 3]], [[2, 2], [3, 1], [2, 1]], [[3, 2], [2, 3]]]
		var pair: Array = pools[strength - 1][index % pools[strength - 1].size()]
		a = pair[0]
		b = pair[1]
	elif mission == 1:
		a = 1 + (index + strength * 2) % 8
		b = 1 + (index % 2)
	elif op == "−":
		var maximum: int = int(MISSIONS[mission].max)
		a = 2 + (index + strength) % (maximum - 1)
		b = (index * 2 + strength) % (a + 1)
	else:
		a = 1 + (index + strength) % 6
		b = 1 + (index * 2 + strength) % (10 - a)
	return {"a": a, "b": b, "op": op}

static func recipe(mission: int, wave: int) -> Array[Dictionary]:
	var result: Array[Dictionary] = []
	var count: int = 10 + mission + wave * 3
	for i: int in range(count):
		var lane: int = 0 if i % 2 == 0 else 2
		# Early preparations with only two strong crew never face three lanes at once.
		if wave > 0 and i % 3 == 1:
			lane = 1
		var kind := "scout"
		if mission >= 2 and i % 4 == 2:
			kind = "skater"
		if mission >= 4 and i % 4 == 1:
			kind = "swarm"
		if mission == 5 and i % 5 == 3:
			kind = "tank"
		if mission == 5 and wave == 2 and i == count - 1:
			kind = "boss"
		result.append({"at": 1.0 + i * 2.5, "lane": lane, "kind": kind})
		if kind == "swarm":
			result.append({"at": 1.7 + i * 2.5, "lane": lane, "kind": kind})
	result.sort_custom(func(a: Dictionary, b: Dictionary) -> bool: return a.at < b.at)
	return result
