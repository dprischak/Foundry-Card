# Foundry Card roadmap


### Keep Entity theme selected when choosing its source

- Reproduce on a new card. Select **Entity** as the theme, then pick the theme source entity. The editor resets the theme to **None** and forces the user to select **Entity** again.
- Treat selecting or replacing `themeentity` as a theme change across all 14 editors. The current handler checks whether `theme` changed, so picking the source can fall into manual override detection when the form still contains the previous appearance values.
- Apply the chosen entity’s current theme when it resolves. Keep Entity mode selected when the source is cleared, unavailable, or points to an unknown theme. Preserve the existing behavior for deliberate edits to theme-controlled fields.
- Add regression coverage for the two-step selection on a new card, changing an existing source, and saving and reopening the editor. Verify the picker sequence in Home Assistant 2026.11.

