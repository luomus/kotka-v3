import { Injectable } from "@nestjs/common";
import { PassportSerializer } from "@nestjs/passport";

@Injectable()
export class CustomSerializer extends PassportSerializer {
  serializeUser(payload: any, done: CallableFunction) {
    done(null, payload);
  }

  deserializeUser(payload: any, done:  CallableFunction) {
    done(null, payload);
  }
}