# Minimal menus

The home screen has one primary action, **Play**, and three quiet secondary choices: **Learn maths**, **My stuff** and **Settings**. One astronaut illustration, the title and the player's name/level remain. Ask for help stays available below the main choices.

Removed from the shared menu shell: the permanent sidebar, repeated astronaut/profile block, repeated Play buttons, decorative star field, explanatory action cards, daily-progress footer and heavy multi-layer borders. A secondary page has Back, its content and Ask for help. Back returns to the relevant parent menu.

**My stuff** groups Rewards & colors, My progress and Space tools. **Learn maths** presents six direct lesson choices and a Quick practice entry. Lesson cards no longer repeat a second Open lesson action or Tap to explore instructions. Quick practice makes the whole skill tile selectable without another nested button.

Content is centered in the space released by the sidebar. Shared cards and buttons have quiet thin edges, shallow pixel corners and no decorative studs or stacked bevels. Detailed pixel sprites and readable typography are retained. No maths, save, resource, combat or reward rules change.

Home and My stuff keyboard navigation follows the visible choices. Lesson arrows select lessons instead of navigating a removed sidebar. Escape returns through the same parent hierarchy as Back.

Desktop preview screenshots and build logs are in ignored `output/minimal-menu/`. Mobile touch and target-phone performance require device review.

## Verification

Both Unity 6000.6.7f1 macOS release builds succeeded: normal 188446623 bytes; preview 188446719 bytes. Desktop review covered Home, My stuff, lesson selection, lesson explanation, entering a question, leaving practice, rewards and settings, including return navigation. Runtime log review found no exceptions or GUI errors. The preview is left on Home. Native pointer automation was unreliable; this was keyboard-assisted review, not mobile multitouch validation.
