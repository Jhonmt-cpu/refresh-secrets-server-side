import { container } from 'tsyringe';

import { DayJsDateProvider } from './implementations/DayjsDateProvider';
import { IDateProvider } from './IDateProvider';

container.registerSingleton<IDateProvider>('DateProvider', DayJsDateProvider);
