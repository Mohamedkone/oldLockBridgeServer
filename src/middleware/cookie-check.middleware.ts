// src/interceptors/cookie-check.interceptor.ts

import {inject, Interceptor, InvocationContext, InvocationResult, Provider, ValueOrPromise} from '@loopback/core';
import {HttpErrors, RestBindings} from '@loopback/rest';
import {Request} from 'express';
const redisDb = require('../datasources/redis.datasource')
const client = redisDb.client

export class CookieCheckInterceptor implements Provider<Interceptor> {
  constructor(@inject(RestBindings.Http.REQUEST) private req: Request) {}

  value() {
    return this.intercept.bind(this);
  }

  async intercept(context: InvocationContext, next: () => ValueOrPromise<InvocationResult>): Promise<InvocationResult> {
    // if(this.req.headers['x-server-request'] === 'stripe-calls'){
    //   return next()
    // }
    if (this.req.headers['x-auth0-postlogin'] === 'true') {
      return next();
    }
    if (this.req.headers['x-auth0-acccreation'] === 'true') {
      return next();
    }
    if (this.req.headers['x-onboarding-acccreation'] === 'true') {
      return next();
    }

    if(this.req.headers['origin'] === 'lockbridge.us.auth0.com'){
      return next()
    }
    if(this.req.headers['origin'] === 'http://localhost:5173'){
      return next()
    }
    if(this.req.headers['origin'] === 'http://localhost:5174'){
      return next()
    }
    if(this.req.headers['server-key'] === '2bb3a133-f58d-4795-941a-b562cca0c72a'){
      return next()
    }



    const authorization = this.req.headers.authorization;
    const login = /^\/login\/.*/;
    const verif = /logO/;
    const check = /guestLogin/;

    if(login.test(this.req.path) || verif.test(this.req.path)|| check.test(this.req.path)){
      return next()
    }

    const checkToken = async(token: string): Promise<boolean> =>{
       const getToken = await client.get(token)
       if(getToken !== null){
        return true
       }
       throw new HttpErrors.Unauthorized('Missing required Authentications')
    }

    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    if (!authorization) {
      throw new HttpErrors.Unauthorized('Missing required Authentications');
    }else{
      await checkToken(authorization)
    }

    return next();
  }
}
