import {BootMixin} from '@loopback/boot';
import {ApplicationConfig, asGlobalInterceptor} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
// import path from 'path';
import {CookieCheckInterceptor} from './middleware/cookie-check.middleware';
import {MySequence} from './sequence';


export {ApplicationConfig};

export class BackEndApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    // this.static('/', path.join(__dirname, '../public'));



    this.bind('interceptors.CookieCheckInterceptor').toProvider(CookieCheckInterceptor).apply(asGlobalInterceptor());
        this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
  }
}
