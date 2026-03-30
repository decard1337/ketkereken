export function userToResponse(user) {
  return {
    id: user.id,
    email: user.email,
    username: user.felhasznalonev,
    role: user.rang,
    profilkep: user.profilkep,
    bio: user.bio,
    letrehozva: user.letrehozva
  }
}
