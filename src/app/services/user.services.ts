import { Injectable } from '@angular/core';

import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable, Subject, Subscription } from 'rxjs/Rx';
import { EntityUtils } from '../pages/common/entity/utils'
import { RestService, WebSocketService } from '../services/';

@Injectable()
export class UserService {
    protected accountUserResource: string = 'account/user'
    protected accountGroupResource: string = 'account/groups'

    constructor(protected rest: RestService){
    };

    listUsers() {
        return this.rest.get(this.accountUserResource, {});
    };

    listGroups() {
        return this.rest.get(this.accountGroupResource , {});
    };
}