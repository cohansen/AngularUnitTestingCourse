import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { HeroService } from './hero.service';
import { MessageService } from './message.service';

describe('HeroService', () => {
  let mockMessageService;
  let heroService: HeroService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    mockMessageService = jasmine.createSpyObj([ 'add' ]);

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        HeroService,
        { provide: MessageService, useValue: mockMessageService }
      ]
    });

    httpTestingController = TestBed.get(HttpTestingController);
    heroService = TestBed.get(HeroService);
  });

  describe('getHero', () => {
    it('should call get with the correct URL', () => {
      // Test for the correct URL.
      heroService.getHero(4).subscribe();

      const request = httpTestingController.expectOne('api/heroes/4');
      request.flush({ id: 4, name: 'SuperDude', strength: 100 });
      // Make sure we're only calling the correct URL.
      httpTestingController.verify();
    });
  });
});
