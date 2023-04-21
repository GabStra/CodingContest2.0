import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Home from '../pages/Home.vue'
import Main from '../pages/Main.vue'
import Login from '../components/Login.vue'
import PasswordRecovery from '../components/PasswordRecovery.vue'
import Exercise from '../components/Exercise.vue'
import NewPassword from '../components/NewPassword.vue'
import Verify from '../components/Verify.vue'
import Registration from '../components/Registration.vue'
import Courses from '../components/Courses.vue'
import CourseForm from '../components/CourseForm.vue'
import Offline from '../components/Offline.vue'
import AvailableCourses from '../components/AvailableCourses.vue'
import CourseStudent from '../components/CourseStudent.vue'
import CourseTeacher from '../components/CourseTeacher.vue'
import ExerciseForm from '../components/ExerciseForm.vue'
import ExecuteExercise from '../components/ExecuteExercise.vue'

export enum URL {
    MAIN = '/main',
    HOME = '/home',
    LOGIN = '/login',
    ERROR = '/errore',
    REGISTRATION = '/registratione-utente',
    NEW_PASSWORD = '/nuova-password',
    PASSWORD_RECOVERY = '/recupera-password',
    EXERCISE = '/docente/esercizio',
    VERIFY = '/verifica',
    COURSES = '/gestione-corsi',
    MANAGE_COURSE = '/gestisci-corso',
    MANAGE_EXERCISE_COPY = '/docente/gestisci-esercizio/copia',
    MANAGE_EXERCISE_EDIT = '/docente/gestisci-esercizio/modifica',
    MANAGE_EXERCISE = '/docente/gestisci-esercizio',
    STUDENT_COURSE = '/studente/corso',
    TEACHER_COURSE = '/docente/corso',
    OFFLINE = '/offline',
    EXECUTE_EXERCISE = '/studente/esercitazione',
}

const HomeRoute: RouteRecordRaw = {
    path: URL.HOME,
    component: Home,
    meta: { requiresLogin: true },
    children: [
        {
            path: '',
            component: AvailableCourses,
        },
        {
            path: URL.EXECUTE_EXERCISE,
            component: ExecuteExercise,
            meta: {
                menuCollapse: true,
            },
        },
        {
            path: URL.COURSES,
            component: Courses,
        },
        {
            path: URL.STUDENT_COURSE,
            component: CourseStudent,
        },
        {
            path: URL.TEACHER_COURSE,
            component: CourseTeacher,
        },
        {
            path: URL.MANAGE_COURSE,
            component: CourseForm,
        },
        {
            path: URL.MANAGE_EXERCISE_COPY,
            component: ExerciseForm,
            meta: {
                copy: true,
            },
        },
        {
            path: URL.MANAGE_EXERCISE_EDIT,
            component: ExerciseForm,
            meta: {
                edit: true,
            },
        },
        {
            path: URL.MANAGE_EXERCISE,
            component: ExerciseForm,
        },
    ],
}

const MainRoute: RouteRecordRaw = {
    path: '',
    component: Main,
    children: [
        {
            path: URL.LOGIN,
            component: Login,
        },
        {
            path: URL.PASSWORD_RECOVERY,
            component: PasswordRecovery,
        },
        {
            path: URL.NEW_PASSWORD,
            component: NewPassword,
        },
        {
            path: URL.VERIFY,
            component: Verify,
        },
        {
            path: URL.REGISTRATION,
            component: Registration,
        },
        {
            path: URL.OFFLINE,
            component: Offline,
        },
    ],
}

const RedirectRoute: RouteRecordRaw = {
    path: '/:pathMatch(.*)*',
    redirect: URL.LOGIN,
}

const routes: RouteRecordRaw[] = [HomeRoute, MainRoute, RedirectRoute]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

router.beforeEach((to, from, next) => {
    if (to.path === '/') {
        next(URL.LOGIN)
        return
    }
    if (to.path === URL.LOGIN && !!document.cookie) {
        next(URL.HOME)
        return
    }

    if (to.meta.requiresLogin && !document.cookie) {
        next(URL.LOGIN)
        return
    }

    next()
})

export { router }
