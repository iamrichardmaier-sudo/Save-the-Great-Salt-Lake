# ev_hydro — hydrology & terminal-lake response evidence (updated 2026-10-22)

## inflow_cv (assumed 0.35) — 1 item, strength 5. ASSUMPTION LOOKS TOO LOW.
Computed from the primary USGS NWIS gauged record (Bear R nr Corinne 10126000 + Weber R nr
Plain City 10141000 + Surplus Canal 10170490), 69 common years 1950-2025:
mean 1,875,736 AF/yr, sd 1,189,548, **CV = 0.634**. Every individual gauge is above 0.6
(0.62 / 0.82 / 0.71; Jordan R 10172630 is 1.04 on its 34-year record). Nothing in the record
supports 0.35. Caveat: these are post-depletion flows, so the series mixes climate with
changing upstream consumptive use, and it omits ungauged inflow, direct precipitation and
groundwater.

## inflow_ar1 (assumed 0.35) — 1 item, strength 5. ASSUMPTION LOOKS TOO LOW.
Same series, 67 consecutive year-pairs: **AR(1) = 0.526** (0.510 on log flows). Per-gauge
0.42-0.73. Droughts in this basin persist more than the model assumes.

## fat_tail_factor (assumed 0.75) — 2 items, strength 5. ASSUMPTION WELL SUPPORTED.
(a) DeRose et al. 2015, 1200-year Bear River tree-ring reconstruction (NOAA bear2015flow):
driest 30-yr window (1232-1261) = **0.752** of the millennial mean; 20-yr 0.694, 50-yr 0.789,
70-yr 0.821. (b) Instrumental cross-check: driest 20-yr window of the gauged record
(2003-2022) = **0.731** of the 1950-2025 mean. Two independent records land on ~0.73-0.75.
Tension: the same reconstruction has 1950-2000 at 1.159x the millennial mean, so measured
against a modern baseline the megadrought multiplier is ~0.65, i.e. 0.75 may be optimistic.

## response_k (assumed 0.12/yr) — 1 item, strength 4. CONSISTENT, PROBABLY OPTIMISTIC.
CA State Water Board D-1631 fact sheet: models put ~20 years on Mono Lake's recovery from
~6,376 ft to the 6,392 ft target. Exponential equivalent k = 0.111 (90% of gap in 20 yr) to
0.139 (95%), bracketing 0.12. But observed: 28 years on, the lake was ~6,378 ft and falling —
real-world approach was slower than modelled. GSL is shallower and broader than Mono, so its
evaporative feedback should make k smaller still.

## lake_recovery_economy / dust_damage — in progress.
