import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should login and store token', () => {
    const dummyResponse = { token: 'fake-jwt-token' };

    service.login({ username: 'test', password: '1234' }).subscribe(res => {
      expect(res.token).toEqual('fake-jwt-token');
      expect(localStorage.getItem('token')).toEqual('fake-jwt-token');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush(dummyResponse);
  });

  it('should logout and clear token', () => {
    localStorage.setItem('token', 'fake-jwt-token');
    service.logout();
    expect(localStorage.getItem('token')).toBeNull();
  });
});
