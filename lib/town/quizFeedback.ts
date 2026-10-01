/**
 * The feedback line under a quiz answer (G-04, G-21; Sep 30 2026). FieldLearning prefixes it with "Correct. " or "Look again. ",
 * so a leading "Yes." / "Right," / "Correct!" in the data would double the praise ("Correct. Right, it's false."). Strip it and
 * re-capitalise. The FULL explanation is shown (route and space questions used to keep only the first sentence, which dropped
 * the "why": "The deeper fixo offers a clear supporting route."). The quiz card scrolls on short phones.
 */
export function quizFeedbackText(text:string|undefined|null):string{
 const t=String(text??'').trim().replace(/^(?:yes|right|correct|exactly)\s*[,.!:;—–-]+\s*/i,'');
 return t?t[0].toUpperCase()+t.slice(1):'';
}
