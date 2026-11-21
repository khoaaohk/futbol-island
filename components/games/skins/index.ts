import type {ArcadeGameId} from '@/lib/arcade/looks/stageLook';
import live from './strikers.module.css';
import runner from './runner.module.css';
import tennis from './tennis.module.css';
import pinball from './pinball.module.css';
import puzzle from './puzzle.module.css';
import kitrush from './kitrush.module.css';
import snake from './snake.module.css';
import airhockey from './airhockey.module.css';
import lineup from './lineup.module.css';
import trophydrop from './trophydrop.module.css';
import rollball from './rollball.module.css';import ballblaster from './ballblaster.module.css';import keepyuppy from './keepyuppy.module.css';import holdtheline from './holdtheline.module.css';

/** Per-game HUD skin class (COORDINATOR FILE). Put on each game's root element together with data-game="<id>". */
export const arcadeSkin:Record<ArcadeGameId,string>={live:live.skin,runner:runner.skin,tennis:tennis.skin,pinball:pinball.skin,puzzle:puzzle.skin,kitrush:kitrush.skin,snake:snake.skin,airhockey:airhockey.skin,lineup:lineup.skin,trophydrop:trophydrop.skin,rollball:rollball.skin,ballblaster:ballblaster.skin,keepyuppy:keepyuppy.skin,holdtheline:holdtheline.skin};
