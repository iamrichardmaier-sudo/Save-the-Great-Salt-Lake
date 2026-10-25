# Stream C — Charts and playback

Owned by **Stream C**. The analysis charts, the year scrubber, and the running "biggest gain,
biggest cost" readout.

Reuses the drawing functions already in `src/ui/charts.ts`. Charts mark the store's current year
and never advance themselves — playback lives in one place and drives every view.
