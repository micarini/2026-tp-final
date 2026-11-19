// Lista de avatares de comida disponibles. Se usa en el servidor (para validar) y en el cliente (para dibujar).
export const AVATARES = [
  { id: "tomate", nombre: "Tomate" },
  { id: "brocoli", nombre: "Brócoli" },
  { id: "huevo", nombre: "Huevo" },
  { id: "palta", nombre: "Palta" },
  { id: "zanahoria", nombre: "Zanahoria" },
  { id: "hongo", nombre: "Hongo" },
  { id: "limon", nombre: "Limón" },
  { id: "berenjena", nombre: "Berenjena" },
];

export const IDS_AVATAR = AVATARES.map((avatar) => avatar.id);
export const AVATAR_INICIAL = "tomate";
