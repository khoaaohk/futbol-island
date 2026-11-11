import type {ArcadeGameId} from '@/lib/arcade/looks/stageLook';
import live from './strikers.module.css';
import runner from './runner.module.css';
import tennis from './tennis.module.css';
import pinball from './pinball.module.css';
import puzzle from './puzzle.module.css';
import kitrush from './kitrush.module.css';
import snake from './snake.module.css';
import airhockey from './airhockey.module.css';

/** Per-game HUD skin class (COORDINATOR FILE). Put on each game's root element together with data-game="<id>". */
export const arcadeSkin:Record<ArcadeGameId,string>={live:live.skin,runner:runner.skin,tennis:tennis.skin,pinball:pinball.skin,puzzle:puzzle.skin,kitrush:kitrush.skin,snake:snake.skin,airhockey:airhockey.skin};
