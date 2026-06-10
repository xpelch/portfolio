# Autogrowth State

This directory stores durable Autogrowth state. It should contain no secrets.
The evaluator updates `state.json` so future runs can detect score movement,
recurring blockers, accepted/rejected feature bets, agent prompt loops, and proof history.
