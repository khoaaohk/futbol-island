# flag-icons (boot studio flags)

- **What:** 52 country flags as SVG (4:3), used by the boot studio's flag stickers and flag badge
  (`components/shop/BootStudio.tsx`, `lib/shop/boots.ts` `FLAGS`).
- **Where:** `public/shop/flags/<code>.svg`, copied unmodified from flag-icons 7.2.3
  (https://github.com/lipis/flag-icons, files `flags/4x3/<code>.svg`). Only the flags in `FLAGS` are bundled.
- **Licence:** MIT, Copyright (c) 2013 Panayiotis Lipiridis. The full licence text ships next to the files as
  `public/shop/flags/LICENSE.txt`.
- **Left out on purpose:** Saudi Arabia (the flag carries religious text, which should not be printed on footwear).
- **Loading:** a flag file is fetched only when the flag picker is open (thumbnails use `loading="lazy"`) or when a placed flag
  is drawn into the sticker atlas. Total for all 52 files is about 0.5 MB; most are under 2 KB (Mexico, Spain, Croatia and
  Ecuador carry detailed coats of arms and are 30–90 KB each).
