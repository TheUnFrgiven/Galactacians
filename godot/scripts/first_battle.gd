class_name FirstBattle
extends RefCounted

var towers: Array[Dictionary] = []
var enemies: Array[Dictionary] = []
var shots: Array[Dictionary] = []
var hearts: int = 5
var elapsed: float = 0.0
var spawned: int = 0
var rescued: int = 0
var done: bool = false
var won: bool = false
# Only two lanes are threatened: two strong towers can cover this opening.
const LANES: Array[int] = [0, 2, 0, 2, 0, 2, 0, 2, 0, 2]
var schedule: Array[Dictionary] = []
const STATS: Dictionary = {
	"scout": [33.0, 39.0, 0.0], "skater": [25.0, 64.0, 0.0],
	"swarm": [19.0, 42.0, 0.0], "tank": [70.0, 25.0, 0.45], "boss": [150.0, 23.0, 0.35],
}

func begin(formation: Array[Dictionary], recipe: Array[Dictionary] = [], starting_hearts: int = 5) -> void:
	towers = formation.duplicate(true)
	for tower: Dictionary in towers:
		tower["cooldown"] = 0.15
		tower["role"] = tower.get("role", "pebble")
		tower["hp"] = (180.0 if tower.role == "bricky" else 50.0) * float(tower.power)
	schedule = recipe.duplicate(true)
	if schedule.is_empty():
		for i: int in range(LANES.size()):
			schedule.append({"at": 1.0 + i * 2.5, "lane": LANES[i], "kind": "scout"})
	enemies.clear()
	shots.clear()
	hearts = starting_hearts
	elapsed = 0.0
	spawned = 0
	rescued = 0
	done = false
	won = false

func step(dt: float) -> void:
	if done:
		return
	elapsed += dt
	while spawned < schedule.size() and elapsed >= float(schedule[spawned].at):
		var entry: Dictionary = schedule[spawned]
		var stats: Array = STATS[entry.kind]
		enemies.append({"x": 1160.0, "lane": entry.lane, "hp": stats[0], "max_hp": stats[0],
			"speed": stats[1], "armor": stats[2], "kind": entry.kind, "slow": 0.0,
			"phase": float(spawned), "hit": 0.0})
		spawned += 1
	for tower: Dictionary in towers:
		if tower.hp <= 0:
			continue
		tower.cooldown -= dt
		if tower.cooldown > 0:
			continue
		var target: Dictionary = {}
		for enemy: Dictionary in enemies:
			if enemy.hp > 0 and enemy.lane == tower.lane and enemy.x >= tower.x - 15 and enemy.x <= tower.x + 700:
				if target.is_empty() or enemy.x < target.x:
					target = enemy
		if not target.is_empty():
			var damage: float = 9.0 * float(tower.power)
			if tower.role == "prism":
				damage *= 2.3
			elif tower.role == "bricky":
				damage *= 0.35
			elif tower.role == "frost":
				damage *= 0.55
				target.slow = 2.2
			elif tower.role == "poppy":
				damage *= 0.8
			target.hp -= damage * (1.0 if tower.role == "prism" else 1.0 - target.armor)
			if tower.role == "poppy":
				for other: Dictionary in enemies:
					if other != target and other.lane == target.lane and absf(other.x - target.x) < 125:
						other.hp -= damage * (1.0 - other.armor)
			target.hit = 0.15
			shots.append({"from": Vector2(tower.x + 24, 225 + tower.lane * 122),
				"to": Vector2(target.x, 225 + target.lane * 122), "life": 0.16, "role": tower.role})
			tower.cooldown = 1.5 if tower.role == "prism" else 1.0 if tower.role == "poppy" else 0.85
	for enemy: Dictionary in enemies:
		if enemy.hp <= 0:
			rescued += 1
			continue
		enemy.hit = maxf(0, enemy.hit - dt)
		enemy.slow = maxf(0, enemy.slow - dt)
		var blocking: Dictionary = {}
		for tower: Dictionary in towers:
			if tower.hp > 0 and tower.lane == enemy.lane and absf(enemy.x - tower.x) < 35:
				blocking = tower
				break
		if blocking.is_empty():
			enemy.x -= enemy.speed * (0.5 if enemy.slow > 0 else 1.0) * dt
		else:
			blocking.hp -= 10.0 * dt
		if enemy.x < 175:
			hearts -= 1
			enemy.hp = -999
	enemies = enemies.filter(func(e: Dictionary) -> bool: return e.hp > 0)
	for shot: Dictionary in shots:
		shot.life -= dt
	shots = shots.filter(func(s: Dictionary) -> bool: return s.life > 0)
	if hearts <= 0:
		hearts = 0
		done = true
	elif spawned == schedule.size() and enemies.is_empty():
		done = true
		won = true

func worried() -> bool:
	for enemy: Dictionary in enemies:
		if enemy.x < 390:
			return true
	return false
