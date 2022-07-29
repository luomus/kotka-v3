import { Injectable } from "@nestjs/common";
import { PassportSerializer } from "@nestjs/passport";

@Injectable()
export class CustomSerializer extends PassportSerializer {
  serializeUser(user: any, done: CallableFunction) {
    done(null, user.id)
  }

  deserializeUser(payload: any, done:  CallableFunction) {
    done(null, payload)
  }
}