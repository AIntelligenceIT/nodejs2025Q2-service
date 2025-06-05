import { request } from './lib'; // Zakładam, że to jest Twój skonfigurowany supertest
import { authRoutes, usersRoutes } from './endpoints';
import { StatusCodes } from 'http-status-codes';
import { CreateUserDto } from '../src/user/dto/create-user.dto'; // Import DTO dla typowania
import { UserWithoutPassword } from '../src/user/interfaces/user.interface';
import { LoginDto } from '../src/auth/dto/login.dto';

// Dane logowania używane w getTokenAndUserId
const diagnosticUserDto: CreateUserDto = {
  login: 'DIAG_USER_LOGIN', // Użyjemy unikalnego loginu dla tego testu
  password: 'DiagPassword123!', // Hasło spełniające walidację
};

// Dane logowania używane w problematycznej funkcji getTokenAndUserId.ts
const getTokenTestUserDto: CreateUserDto = {
  login: 'TEST_AUTH_LOGIN', // Dokładnie ten login
  password: 'Tu6!@#%&',    // Dokładnie to hasło
};

describe('Auth Process Diagnostic (e2e)', () => {
  let createdUserId: string | null = null;
  const commonHeaders = { Accept: 'application/json' };
  // Nie dodajemy tutaj globalnego tokenu, bo testujemy sam proces jego uzyskiwania

  afterEach(async () => {
    // Próba usunięcia użytkownika stworzonego w tym teście, jeśli istnieje
    // UWAGA: Ten krok wymaga, aby endpoint DELETE /user/:id działał poprawnie
    // i aby UsersService (in-memory) faktycznie usuwał użytkownika.
    // Jeśli getTokenAndUserId zawodzi, ten użytkownik może nie zostać poprawnie usunięty
    // przez standardowe mechanizmy testowe, więc próbujemy go usunąć tutaj.
    // Potrzebny byłby token admina lub tymczasowe wyłączenie ochrony na DELETE /user/:id dla tego cleanupu,
    // co jest poza zakresem tego testu. Na razie zakładamy, że UsersService.users jest czyszczone inaczej
    // lub akceptujemy, że ten użytkownik może pozostać w pamięci UsersService.
    // Dla celów czysto diagnostycznych samego signup/login, ten cleanup jest mniej krytyczny.

    // Jeśli chcielibyśmy faktycznie czyścić, potrzebowalibyśmy tokenu.
    // Na potrzeby tego testu, jeśli UsersService nie jest czyszczony globalnie,
    // ten użytkownik pozostanie.
    if (createdUserId) {
      console.log(`[DIAG_TEST] User ${createdUserId} was created. Manual cleanup might be needed if UsersService is not cleared globally.`);
      // Przykład, jak można by próbować usunąć, gdybyśmy mieli token:
      // try {
      //   await request
      //     .delete(usersRoutes.delete(createdUserId))
      //     .set(commonHeaders) // Musiałby zawierać poprawny token
      //     .expect(StatusCodes.NO_CONTENT);
      //   console.log(`[DIAG_TEST] Cleaned up user: ${createdUserId}`);
      // } catch (error) {
      //   console.error(`[DIAG_TEST] Failed to cleanup user ${createdUserId}:`, error.message);
      // }
      createdUserId = null;
    }
  });

  it('should successfully sign up a new user and then log in with that user', async () => {
    // --- Krok 1: Rejestracja użytkownika (Signup) ---
    console.log('[DIAG_TEST] Attempting signup with DTO:', diagnosticUserDto);
    const signupResponse = await request
      .post(authRoutes.signup)
      .set(commonHeaders)
      .send(diagnosticUserDto);

    console.log('[DIAG_TEST] Signup Response Status:', signupResponse.status);
    console.log('[DIAG_TEST] Signup Response Body:', JSON.stringify(signupResponse.body, null, 2));

    expect(signupResponse.status).toBe(StatusCodes.CREATED);
    
    const signedUpUser = signupResponse.body as UserWithoutPassword;
    expect(signedUpUser).toBeInstanceOf(Object);
    expect(signedUpUser.id).toBeDefined();
    expect(typeof signedUpUser.id).toBe('string');
    expect(signedUpUser.login).toBe(diagnosticUserDto.login);
    expect(signedUpUser).not.toHaveProperty('password');
    
    createdUserId = signedUpUser.id; // Zapisz ID do ewentualnego cleanupu

    // --- Krok 2: Logowanie użytkownika (Login) ---
    const loginDto: LoginDto = {
      login: diagnosticUserDto.login,
      password: diagnosticUserDto.password,
    };
    console.log('[DIAG_TEST] Attempting login with DTO:', loginDto);

    const loginResponse = await request
      .post(authRoutes.login)
      .set(commonHeaders)
      .send(loginDto);

    console.log('[DIAG_TEST] Login Response Status:', loginResponse.status);
    console.log('[DIAG_TEST] Login Response Body:', JSON.stringify(loginResponse.body, null, 2));

    expect(loginResponse.status).toBe(StatusCodes.OK);

    expect(loginResponse.body).toBeInstanceOf(Object);
    expect(loginResponse.body.accessToken).toBeDefined();
    expect(typeof loginResponse.body.accessToken).toBe('string');
    expect(loginResponse.body.accessToken.length).toBeGreaterThan(0);

    expect(loginResponse.body.refreshToken).toBeDefined();
    expect(typeof loginResponse.body.refreshToken).toBe('string');
    expect(loginResponse.body.refreshToken.length).toBeGreaterThan(0);

    console.log('[DIAG_TEST] Signup and Login process successful.');
  });

  it('should fail to log in with incorrect password', async () => {
    // Ten test zakłada, że użytkownik DIAG_USER_LOGIN został pomyślnie stworzony
    // w poprzednim teście lub istnieje. Dla pełnej izolacji, można by go tu stworzyć ponownie.
    // Jednak dla uproszczenia, polegamy na tym, że UsersService nie jest czyszczony między `it` w tym samym `describe`
    // LUB że użytkownik jest tworzony na nowo przy każdym wywołaniu signup.
    // Jeśli UsersService.create nie sprawdza duplikatów, to kolejne wywołanie signup stworzy nowego użytkownika
    // z tym samym loginem, a findByLogin znajdzie pierwszego.

    // Najpierw upewnijmy się, że użytkownik istnieje (lub stwórzmy go)
    await request
      .post(authRoutes.signup)
      .set(commonHeaders)
      .send(diagnosticUserDto); // Ignorujemy odpowiedź, zakładamy, że się powiedzie lub już istnieje

    const loginDto: LoginDto = {
      login: diagnosticUserDto.login,
      password: 'IncorrectPassword123!',
    };
    console.log('[DIAG_TEST] Attempting login with incorrect password, DTO:', loginDto);

    const loginResponse = await request
      .post(authRoutes.login)
      .set(commonHeaders)
      .send(loginDto);

    console.log('[DIAG_TEST] Incorrect Login Response Status:', loginResponse.status);
    console.log('[DIAG_TEST] Incorrect Login Response Body:', JSON.stringify(loginResponse.body, null, 2));

    expect(loginResponse.status).toBe(StatusCodes.UNAUTHORIZED); // Lub FORBIDDEN, zależnie od implementacji AuthService.login
  });

  it('should fail to log in with non-existent user', async () => {
    const loginDto: LoginDto = {
      login: 'NonExistentUserLogin123',
      password: 'anyPassword',
    };
    console.log('[DIAG_TEST] Attempting login with non-existent user, DTO:', loginDto);

    const loginResponse = await request
      .post(authRoutes.login)
      .set(commonHeaders)
      .send(loginDto);

    console.log('[DIAG_TEST] Non-existent User Login Response Status:', loginResponse.status);
    console.log('[DIAG_TEST] Non-existent User Login Response Body:', JSON.stringify(loginResponse.body, null, 2));

    expect(loginResponse.status).toBe(StatusCodes.UNAUTHORIZED); // Lub FORBIDDEN, zależnie od implementacji AuthService.login
  });

  it('should successfully sign up and log in with TEST_AUTH_LOGIN credentials used by getTokenAndUserId.ts', async () => {
    // --- Krok 1: Rejestracja użytkownika (Signup) z danymi z getTokenAndUserId.ts ---
    console.log('[DIAG_TEST_TOKEN_UTIL_SIGNUP] Attempting signup with DTO:', getTokenTestUserDto);
    const signupResponse = await request
      .post(authRoutes.signup)
      .set(commonHeaders)
      .send(getTokenTestUserDto);

    console.log('[DIAG_TEST_TOKEN_UTIL_SIGNUP] Signup Response Status:', signupResponse.status);
    console.log('[DIAG_TEST_TOKEN_UTIL_SIGNUP] Signup Response Body:', JSON.stringify(signupResponse.body, null, 2));

    // Sprawdzamy, czy rejestracja się powiodła (oczekujemy 201 CREATED)
    // Jeśli tu będzie np. 400 BAD_REQUEST, to prawdopodobnie hasło 'Tu6!@#%&' nie przechodzi walidacji DTO.
    expect(signupResponse.status).toBe(StatusCodes.CREATED);
    
    const signedUpUser = signupResponse.body as UserWithoutPassword;
    expect(signedUpUser).toBeInstanceOf(Object);
    expect(signedUpUser.id).toBeDefined();
    expect(typeof signedUpUser.id).toBe('string');
    expect(signedUpUser.login).toBe(getTokenTestUserDto.login);
    expect(signedUpUser).not.toHaveProperty('password');
    
    createdUserId = signedUpUser.id; // Zapisz ID do logowania w afterEach

    // --- Krok 2: Logowanie użytkownika (Login) z danymi z getTokenAndUserId.ts ---
    const loginDto: LoginDto = {
      login: getTokenTestUserDto.login,
      password: getTokenTestUserDto.password,
    };
    console.log('[DIAG_TEST_TOKEN_UTIL_LOGIN] Attempting login with DTO:', loginDto);

    const loginResponse = await request
      .post(authRoutes.login)
      .set(commonHeaders)
      .send(loginDto);

    console.log('[DIAG_TEST_TOKEN_UTIL_LOGIN] Login Response Status:', loginResponse.status);
    console.log('[DIAG_TEST_TOKEN_UTIL_LOGIN] Login Response Body:', JSON.stringify(loginResponse.body, null, 2));

    expect(loginResponse.status).toBe(StatusCodes.OK);
    expect(loginResponse.body.accessToken).toBeDefined();
    expect(typeof loginResponse.body.accessToken).toBe('string');
    console.log('[DIAG_TEST_TOKEN_UTIL] Signup and Login with TEST_AUTH_LOGIN credentials successful.');
  });
});
