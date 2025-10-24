import { promises as fs } from 'fs'
import path from 'path'

export type Player = {
  id: string
  address: string
  name?: string | null
  createdAt: string
}

const dataFile = path.resolve(process.cwd(), 'client', 'data', 'players.json')

async function readFile(): Promise<Player[]> {
  try {
    const raw = await fs.readFile(dataFile, 'utf8')
    return JSON.parse(raw) as Player[]
  } catch (err) {

    return []
  }
}

async function writeFile(players: Player[]) {
  const dir = path.dirname(dataFile)
  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(dataFile, JSON.stringify(players, null, 2), 'utf8')
}

export async function getPlayers(): Promise<Player[]> {
  return readFile()
}

export async function addPlayer(p: { address: string; name?: string }): Promise<Player> {
  const players = await readFile()
  const exists = players.find((x) => x.address.toLowerCase() === p.address.toLowerCase())
  if (exists) {
    return exists
  }

  const newPlayer: Player = {
    id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    address: p.address,
    name: p.name || null,
    createdAt: new Date().toISOString(),
  }

  players.push(newPlayer)
  await writeFile(players)
  return newPlayer
}

export async function clearPlayers() {
  await writeFile([])
}
