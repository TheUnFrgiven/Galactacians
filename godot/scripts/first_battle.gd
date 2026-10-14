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

func begin(formation: Array[Dictionary]) -> void:
	towers = formation.duplicate(true)
	for tower: Dictionary in towers:
		tower["cooldown"] = 0.15
		tower["hp"] = 50.0 * float(tower.power)
	enemies.clear()
	shots.clear()
	hearts = 5
	elapsed = 0.0
	spawned = 0
	rescued = 0
	done = false
	won = false

func step(dt: float) -> void:
	if done:
		return
	elapsed += dt
	if spawned < LANES.size() and elapsed >= 1.0 + spawned * 2.5:
		enemies.append({"x": 1160.0, "lane": LANES[spawned], "hp": 33.0,
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
			target.hp -= 9.0 * float(tower.power)
			target.hit = 0.15
			shots.append({"from": Vector2(tower.x + 24, 225 + tower.lane * 122),
				"to": Vector2(target.x, 225 + target.lane * 122), "life": 0.16})
			tower.cooldown = 0.85
	for enemy: Dictionary in enemies:
		if enemy.hp <= 0:
			rescued += 1
			continue
		enemy.hit = maxf(0, enemy.hit - dt)
		var blocking: Dictionary = {}
		for tower: Dictionary in towers:
			if tower.hp > 0 and tower.lane == enemy.lane and absf(enemy.x - tower.x) < 35:
				blocking = tower
				break
		if blocking.is_empty():
			enemy.x -= 39.0 * dt
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
	elif spawned == LANES.size() and enemies.is_empty():
		done = true
		won = true

func worried() -> bool:
	for enemy: Dictionary in enemies:
		if enemy.x < 390:
			return true
	return false
