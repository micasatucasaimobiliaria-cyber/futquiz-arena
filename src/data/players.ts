export type Player = {
  id: string;
  name: string;
  nationality: string;
  position: string;
  age: number;
  shirtNumber: number;
  currentClub: string;
  formerClubs: string[];
  trophies: string[];
  emoji: string;
  gradient: string;
  aliases?: string[];
};

export const players: Player[] = [
  {
    id: "cr7", name: "Cristiano Ronaldo", nationality: "Portugal 🇵🇹", position: "Avançado",
    age: 40, shirtNumber: 7, currentClub: "Al-Nassr",
    formerClubs: ["Sporting CP", "Manchester United", "Real Madrid", "Juventus"],
    trophies: ["5x Champions League", "5x Bola de Ouro", "Euro 2016", "Nations League"],
    emoji: "🐐", gradient: "from-yellow-500 to-red-600",
    aliases: ["cr7", "ronaldo", "cristiano"],
  },
  {
    id: "messi", name: "Lionel Messi", nationality: "Argentina 🇦🇷", position: "Avançado",
    age: 38, shirtNumber: 10, currentClub: "Inter Miami",
    formerClubs: ["Barcelona", "Paris Saint-Germain"],
    trophies: ["4x Champions League", "8x Bola de Ouro", "Copa do Mundo 2022"],
    emoji: "🐐", gradient: "from-sky-400 to-blue-700",
    aliases: ["messi", "leo messi", "lionel"],
  },
  {
    id: "neymar", name: "Neymar", nationality: "Brasil 🇧🇷", position: "Avançado",
    age: 33, shirtNumber: 10, currentClub: "Santos",
    formerClubs: ["Barcelona", "Paris Saint-Germain", "Al-Hilal"],
    trophies: ["Champions League 2015", "Copa Libertadores", "Olimpíada 2016"],
    emoji: "✨", gradient: "from-yellow-400 to-green-600",
    aliases: ["neymar", "neymar jr", "ney"],
  },
  {
    id: "mbappe", name: "Kylian Mbappé", nationality: "França 🇫🇷", position: "Avançado",
    age: 26, shirtNumber: 9, currentClub: "Real Madrid",
    formerClubs: ["Monaco", "Paris Saint-Germain"],
    trophies: ["Copa do Mundo 2018", "6x Ligue 1", "Champions League 2025"],
    emoji: "🚀", gradient: "from-blue-500 to-red-500",
    aliases: ["mbappe", "mbappé", "kylian"],
  },
  {
    id: "modric", name: "Luka Modrić", nationality: "Croácia 🇭🇷", position: "Médio",
    age: 40, shirtNumber: 10, currentClub: "AC Milan",
    formerClubs: ["Dinamo Zagreb", "Tottenham", "Real Madrid"],
    trophies: ["6x Champions League", "Bola de Ouro 2018"],
    emoji: "🎩", gradient: "from-red-600 to-white",
    aliases: ["modric", "modrić", "luka"],
  },
  {
    id: "ramos", name: "Sergio Ramos", nationality: "Espanha 🇪🇸", position: "Defesa Central",
    age: 39, shirtNumber: 4, currentClub: "Monterrey",
    formerClubs: ["Sevilla", "Real Madrid", "Paris Saint-Germain"],
    trophies: ["4x Champions League", "Euro 2008/2012", "Copa do Mundo 2010"],
    emoji: "🛡️", gradient: "from-red-700 to-yellow-500",
    aliases: ["ramos", "sergio ramos"],
  },
  {
    id: "pepe", name: "Pepe", nationality: "Portugal 🇵🇹", position: "Defesa Central",
    age: 42, shirtNumber: 3, currentClub: "Aposentado",
    formerClubs: ["Marítimo", "Porto", "Real Madrid", "Beşiktaş"],
    trophies: ["3x Champions League", "Euro 2016", "Nations League"],
    emoji: "🗡️", gradient: "from-green-700 to-red-700",
    aliases: ["pepe", "kepler"],
  },
  {
    id: "felix", name: "João Félix", nationality: "Portugal 🇵🇹", position: "Avançado",
    age: 26, shirtNumber: 7, currentClub: "Al-Nassr",
    formerClubs: ["Benfica", "Atlético Madrid", "Chelsea", "Barcelona"],
    trophies: ["La Liga 2021", "Golden Boy 2019"],
    emoji: "💎", gradient: "from-red-600 to-amber-500",
    aliases: ["felix", "joão félix", "joao felix"],
  },
  {
    id: "bruno", name: "Bruno Fernandes", nationality: "Portugal 🇵🇹", position: "Médio Ofensivo",
    age: 31, shirtNumber: 8, currentClub: "Manchester United",
    formerClubs: ["Novara", "Udinese", "Sampdoria", "Sporting CP"],
    trophies: ["FA Cup 2024", "Europa League 2025", "Capitão do United"],
    emoji: "⚡", gradient: "from-red-600 to-yellow-400",
    aliases: ["bruno", "bruno fernandes", "bruno fer"],
  },
  {
    id: "bernardo", name: "Bernardo Silva", nationality: "Portugal 🇵🇹", position: "Médio",
    age: 31, shirtNumber: 20, currentClub: "Manchester City",
    formerClubs: ["Benfica", "Monaco"],
    trophies: ["6x Premier League", "Champions League 2023"],
    emoji: "🪄", gradient: "from-sky-400 to-indigo-600",
    aliases: ["bernardo", "bernardo silva"],
  },
  {
    id: "figo", name: "Luís Figo", nationality: "Portugal 🇵🇹", position: "Extremo",
    age: 53, shirtNumber: 7, currentClub: "Aposentado",
    formerClubs: ["Sporting CP", "Barcelona", "Real Madrid", "Inter Milão"],
    trophies: ["Champions League 2010", "Bola de Ouro 2000"],
    emoji: "👑", gradient: "from-blue-700 to-red-600",
    aliases: ["figo", "luis figo", "luís figo"],
  },
  {
    id: "ruicosta", name: "Rui Costa", nationality: "Portugal 🇵🇹", position: "Médio",
    age: 53, shirtNumber: 10, currentClub: "Aposentado",
    formerClubs: ["Benfica", "Fiorentina", "AC Milan"],
    trophies: ["Champions League 2003", "Presidente do Benfica"],
    emoji: "🎼", gradient: "from-red-600 to-rose-400",
    aliases: ["rui costa", "rui"],
  },
  {
    id: "ronaldinho", name: "Ronaldinho", nationality: "Brasil 🇧🇷", position: "Avançado",
    age: 45, shirtNumber: 10, currentClub: "Aposentado",
    formerClubs: ["Grêmio", "PSG", "Barcelona", "AC Milan", "Flamengo"],
    trophies: ["Champions League 2006", "Bola de Ouro 2005", "Copa do Mundo 2002"],
    emoji: "😁", gradient: "from-yellow-400 to-green-500",
    aliases: ["ronaldinho", "ronaldinho gaúcho", "dinho"],
  },
  {
    id: "r9", name: "Ronaldo Nazário", nationality: "Brasil 🇧🇷", position: "Avançado",
    age: 49, shirtNumber: 9, currentClub: "Aposentado",
    formerClubs: ["Cruzeiro", "PSV", "Barcelona", "Inter", "Real Madrid", "AC Milan"],
    trophies: ["2x Copa do Mundo", "2x Bola de Ouro", "Fenómeno"],
    emoji: "👽", gradient: "from-emerald-400 to-yellow-500",
    aliases: ["ronaldo nazario", "r9", "ronaldo fenomeno", "ronaldo nazário", "fenômeno"],
  },
  {
    id: "zlatan", name: "Zlatan Ibrahimović", nationality: "Suécia 🇸🇪", position: "Avançado",
    age: 44, shirtNumber: 11, currentClub: "Aposentado",
    formerClubs: ["Ajax", "Juventus", "Inter", "Barcelona", "PSG", "Man United", "LA Galaxy", "AC Milan"],
    trophies: ["13x Campeonatos Nacionais", "Europa League 2017"],
    emoji: "🦁", gradient: "from-yellow-400 to-blue-700",
    aliases: ["zlatan", "ibrahimovic", "ibra", "ibrahimović"],
  },
];

export const normalizeAnswer = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

export const checkAnswer = (input: string, player: Player) => {
  const n = normalizeAnswer(input);
  if (!n) return false;
  if (normalizeAnswer(player.name) === n) return true;
  return (player.aliases ?? []).some((a) => normalizeAnswer(a) === n);
};
