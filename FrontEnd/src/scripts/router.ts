import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Home from "../pages/Home.vue";
import Main from "../pages/Main.vue";
import Login from "../components/Login.vue";
import PasswordRecovery from "../components/PasswordRecovery.vue";
import Exercise from "../pages/Exercise.vue";
import NewPassword from "../components/NewPassword.vue";
import Verify from "../components/Verify.vue";
import Registration from "../components/Registration.vue";
import Courses from "../components/Courses.vue";
import CourseUpsert from "../components/CourseUpsert.vue";
import Offline from "../components/Offline.vue";
import AvailableCourses from "../components/AvailableCourses.vue";
import Course from "../components/Course.vue";

export enum URL {
  MAIN = "/main",
  HOME = "/home",
  LOGIN = "/login",
  ERROR = "/errore",
  REGISTRATION = "/registratione-utente",
  NEW_PASSWORD = "/nuova-password",
  PASSWORD_RECOVERY = "/recupera-password",
  EXERCISE = "/exercise",
  VERIFY = "/verifica",
  COURSES = "/gestione-corsi",
  MANAGE_COURSE = "/gestisci-corso/:id?",
  COURSE = "/corso/:id?",
  OFFLINE = "/offline",
}

export enum ROUTES {
  MAIN = "main",
  HOME = "home",
  LOGIN = "login",
  ERROR = "error",
  REGISTRATION = "registration",
  NEW_PASSWORD = "new_password",
  PASSWORD_RECOVERY = "password_recovery",
  EXERCISE = "exercise",
  VERIFY = "verify",
  COURSES = "courses",
  MANAGE_COURSE = "manage-course",
  COURSE = "course",
  OFFLINE = "offline",
}

const HomeRoute: RouteRecordRaw = {
  path: URL.HOME,
  component: Home,
  meta: { requiresLogin: true },
  children: [
    {
      path: "",
      name: ROUTES.HOME,
      component: AvailableCourses,
    },
    {
      path: URL.EXERCISE,
      name: ROUTES.EXERCISE,
      component: Exercise,
    },
    {
      path: URL.COURSES,
      name: ROUTES.COURSES,
      component: Courses,
    },
    {
      path: URL.COURSE,
      name: ROUTES.COURSE,
      component: Course,
    },
    {
      path: URL.MANAGE_COURSE,
      name: ROUTES.MANAGE_COURSE,
      component: CourseUpsert,
    },
  ],
};

const MainRoute: RouteRecordRaw = {
  path: "",
  component: Main,
  children: [
    {
      path: URL.LOGIN,
      name: ROUTES.LOGIN,
      component: Login,
    },
    {
      path: URL.PASSWORD_RECOVERY,
      name: ROUTES.PASSWORD_RECOVERY,
      component: PasswordRecovery,
    },
    {
      path: URL.NEW_PASSWORD,
      name: ROUTES.NEW_PASSWORD,
      component: NewPassword,
    },
    {
      path: URL.VERIFY,
      name: ROUTES.VERIFY,
      component: Verify,
    },
    {
      path: URL.REGISTRATION,
      name: ROUTES.REGISTRATION,
      component: Registration,
    },
    {
      path: URL.OFFLINE,
      name: ROUTES.OFFLINE,
      component: Offline,
    },
  ],
};

const RedirectRoute: RouteRecordRaw = {
  path: "/:pathMatch(.*)*",
  redirect: URL.LOGIN,
};

const routes: RouteRecordRaw[] = [HomeRoute, MainRoute, RedirectRoute];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  if (to.path === "/") {
    next(URL.LOGIN);
    return;
  }
  if (to.path === URL.LOGIN && !!document.cookie) {
    next(URL.HOME);
    return;
  }

  if (to.meta.requiresLogin && !document.cookie) {
    next(URL.LOGIN);
    return;
  }

  next();
});

export { router };
