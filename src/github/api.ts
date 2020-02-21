import fetch from "node-fetch"
import { validate } from "jsonschema"


export const avatar = async (user: string) => {
  const res = await fetch(`https://avatars.githubusercontent.com/${user}`)
  return res.blob()
}


export const repos = async (user: string) => {
  const res = await fetch(`https://api.github.com/users/${user}/repos`)
  return res.json()
}
