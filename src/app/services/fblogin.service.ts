import {Injectable, NgZone} from '@angular/core';
import {Router} from '@angular/router';


import {BehaviorSubject, Observable, of, Subject} from 'rxjs';
import {auth} from 'firebase/app';
import {AngularFirestore, AngularFirestoreDocument} from 'angularfire2/firestore';
import {AngularFireAuth} from 'angularfire2/auth';
import {Funcs} from '../utility/function';
import {catchError, switchMap} from 'rxjs/operators';
import {distinctUntilChanged, map} from 'rxjs/internal/operators';
import {Facebook, ILocalUser, LocalUser} from '../models/localuser';
import {UiService} from '@services/ui.service';

@Injectable({
  providedIn: 'root'
})
export class FbloginService {
  currentUser: BehaviorSubject<LocalUser>;
  $logged: Observable<LocalUser>;
  isAuthenticated$: Observable<boolean>;
  dataFetched = new Subject<boolean>();
  public userRef = (id: string): AngularFirestoreDocument<ILocalUser> => this.afs.doc(`fbusers/${id}`);
  init = (): void => {
    this.currentUser = new BehaviorSubject<LocalUser>(null);
    this.isAuthenticated$ = this.afAuth.authState.pipe(
      map((res) => !!res)
    );
    this.$logged = this.afAuth.authState.pipe(
      switchMap((user) => user ? this.userRef(user.uid).valueChanges() : of(null)),
      catchError(err => {
        this.functions.handleError(err.message);
        return of(null);
      })
    );
    this.$logged.subscribe((users) => {
      this.currentUser.next(users);
      this.dataFetched.next(!!users);
    });
  }

  signin = () => this.afAuth.auth.signInWithPopup(new auth.FacebookAuthProvider())
    .then(
      (res: any) => res.additionalUserInfo.isNewUser ?
        this.userRef(res.user.uid).set({
          uid: res.user.uid,
          name: res.additionalUserInfo.profile.name,
          email: {
            value: res.additionalUserInfo.profile.email,
            verified: res.user.emailVerified,
          },
          facebook: {
            Token: res.credential.accessToken,
            facebookID: res.additionalUserInfo.profile.id,
            facebookLink: res.additionalUserInfo.profile.link,
          },
          personal: {
            gender: res.additionalUserInfo.profile.gender,
            phoneNumber: res.user.phoneNumber,
            picture: res.additionalUserInfo.profile.picture.data.url,
          },
          campus: {
            isAmbassador: true,
            posts: [],
            validPosts: [],
            likes: 0,
            shares: 0,
            otherPoints: 0,
            ideaPoints: 0,
            totalPoints: 0,
            isExclusive: false,
            rank: false,
            exclusiveApproved: false,
          }
        }as ILocalUser)
          .catch((err) => this.functions.handleError(err.message)) :
        this.userRef(res.user.uid).update({
          facebook: {
            Token: res.credential.accessToken,
            facebookID: res.additionalUserInfo.profile.id,
            facebookLink: res.additionalUserInfo.profile.link,
          } as Facebook
        })
    )

  updateUser = (user: LocalUser) => this.userRef(user.uid).set({...user} as ILocalUser)
    .then(() => this.currentUser.next(user))

  constructor(private router: Router,
              private afAuth: AngularFireAuth,
              private afs: AngularFirestore,
              private functions: Funcs,
              public zone: NgZone,
              private ui: UiService) {
    this.dataFetched.pipe(distinctUntilChanged()).subscribe(
      (val) => val ? this.zone.run(() => this.router.navigate(['/dashboard'])) : false
    );
    this.init();
  }

  updateRegistration(user: LocalUser) {
    this.updateUser(user)
      .then(() => this.zone.run(() => this.router.navigate(['/dashboard/home'])))
      .catch((err) => this.functions.handleError(err));
  }

  signOut() {
    this.afAuth.auth.signOut()
      .then(() => this.zone.run(() => this.router.navigate(['/'])))
      .catch(err => this.functions.handleError(err.message));
    this.ui.scrollPos.next(false);
  }
}

