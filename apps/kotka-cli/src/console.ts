import { BootstrapConsole } from 'nestjs-console';
import { KotkaCliModule } from './kotka-cli.module';

const bootstrap = new BootstrapConsole({
  module: KotkaCliModule,
  useDecorators: true
});
bootstrap.init().then(async (app) => {
  try {
    await app.init();
    await bootstrap.boot();
    await app.close();
  } catch (e) {
    console.error(e);
    await app.close();
    process.exit(1);
  }
})