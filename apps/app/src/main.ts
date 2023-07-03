import { enableProdMode } from '@angular/core';

const NX_ENVIRONMENT = process.env['NX_ENVIRONMENT'] || 'development';

if (NX_ENVIRONMENT === 'production') {
  enableProdMode();
}

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { CoreModule } from '@properproperty/app/core/feature';
platformBrowserDynamic()
  .bootstrapModule(CoreModule)
  .catch((err) => console.error(err));
