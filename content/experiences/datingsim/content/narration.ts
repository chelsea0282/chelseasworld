import { AVELINE_HOME, LETTER, MAP } from "./assets";

export type PrologueCard = {
  background: string;
  overlay?: string;
  text: string;
};

export const prologue: PrologueCard[] = [
  {
    background: MAP,
    text: "This is eldermere empire\n\nWhere very spring, the royal family hosts the debutante ball that marks the beginning of the social season.\n\nWith the start of the social season, everyone’s interest falls on ’The Registry’. The unofficial list that surfaces right around the debutante that ranks every unmarried noble in the empire. Bloodline, dowry, lands, temperament. Somehow all of this is taken into consideration to rank every single noble in the capital.",
  },
  {
    background: LETTER,
    text: "Dear Lady Aveline\n\nWe are pleased to invite you to the 350th debutante.",
  },
  {
    background: AVELINE_HOME,
    text: "You are Lady Aveline of Mereth (19), in the southern marches, where the roads wash out in spring and the Ministry's clerks have never once been.\n\nYour mother built the greenhouse before she died. You keep her peonies alive in it — badly, stubbornly, every year, because no one else will.\n\nYour aunt has told you last week over dinner that when she was 19, she met her husband and got married and that she expects you to do the same.\n\nShe never says anything important…\n\nYour parents fell in love and got married against your grandparents will and you believe that you can find something like that too.\n\nThis is going to be the first time you’re going to the capital which you’ve dreamed about.\n\nWill the balls be as grand as people say?\n\nWill the men of the capital be as chivalrous as your cousins talked about?\n\nYou can’t wait to see all this for yourself.\n\nButton appears ‘continue’. Button is gold and ‘continue’s is written very ornately.",
  },
];