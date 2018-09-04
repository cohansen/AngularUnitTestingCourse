import { By } from '@angular/platform-browser';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs/observable/of';

import { HeroesComponent } from './heroes.component';
import { HeroService } from './../hero.service';
import { HeroComponent } from '../hero/hero.component';
import { Directive, Input } from '@angular/core';

@Directive({
  selector: '[routerLink]',
  host: { '(click)': 'onClick()' }
})
export class RouterLinkDirectiveStub {
  @Input('routerLink') linkParams: any;
  navigatedTo: any = null;

  onClick() {
    this.navigatedTo = this.linkParams;
  }
}

describe('HeroesComponent', () => {
  let fixture: ComponentFixture<HeroesComponent>;
  let mockHeroService;
  let HEROES;

  beforeEach(() => {
    HEROES = [
      { id: 1, name: 'SpiderDude', strength: 8 },
      { id: 2, name: 'Wonderful Woman', strength: 24 },
      { id: 3, name: 'SuperDude', strength: 55 },
    ];

    mockHeroService = jasmine.createSpyObj(['getHeroes', 'addHero', 'deleteHero']);

    TestBed.configureTestingModule({
      declarations: [
        HeroesComponent,
        HeroComponent,
        RouterLinkDirectiveStub
      ],
      providers: [{ provide: HeroService, useValue: mockHeroService }],
    });

    fixture = TestBed.createComponent(HeroesComponent);
  });

  describe('delete', () => {
    it('should remove the indicated hero from the heroes list', () => {
      mockHeroService.deleteHero.and.returnValue(of(true));
      fixture.componentInstance.heroes = HEROES;
      
      fixture.componentInstance.delete(HEROES[2]);

      expect(fixture.componentInstance.heroes.length).toBe(2);
    });

    it('should call deleteHero with the correct hero', () => {
      mockHeroService.deleteHero.and.returnValue(of(true));
      fixture.componentInstance.heroes = HEROES;

      fixture.componentInstance.delete(HEROES[2]);

      expect(mockHeroService.deleteHero).toHaveBeenCalledWith(HEROES[2]);
    });
  });

  describe('Shallow Tests', () => {
    it('should set heroes correctly from the service', () => {
      mockHeroService.getHeroes.and.returnValue(of(HEROES));

      fixture.detectChanges();

      expect(fixture.componentInstance.heroes.length).toBe(3);
    });

    it('should create one li for each hero', () => {
      mockHeroService.getHeroes.and.returnValue(of(HEROES));

      fixture.detectChanges();

      expect(fixture.debugElement.queryAll(By.css('li')).length).toBe(3);
    });
  });

  // Testing interaction between 2 components (HeroesComponent and HeroComponent)
  describe('Deep Tests', () => {
    it('should render each hero as a HeroComponent', () => {
      mockHeroService.getHeroes.and.returnValue(of(HEROES));

      fixture.detectChanges();

      const heroComponentDes = fixture.debugElement.queryAll(By.directive(HeroComponent));

      expect(heroComponentDes.length).toEqual(3);

      for (let i = 0; i < heroComponentDes.length; i++) {
        expect(heroComponentDes[i].componentInstance.hero).toEqual(HEROES[i]);
      }
    });

    it(`Should call HeroService.deleteHero when the HeroComponent's delete
      delete button is clicked`, () => {
      spyOn(fixture.componentInstance, 'delete');
      mockHeroService.getHeroes.and.returnValue(of(HEROES));

      fixture.detectChanges();

      const heroComponents = fixture.debugElement.queryAll(By.directive(HeroComponent));
      (<HeroComponent> heroComponents[0].componentInstance).delete.emit(undefined);

      expect(fixture.componentInstance.delete).toHaveBeenCalledWith(HEROES[0]);
    });

    it('should add a new hero to the hero list when the add button is clicked', () => {
      mockHeroService.getHeroes.and.returnValue(of(HEROES));

      fixture.detectChanges();

      const name = 'Mr. Ice';
      mockHeroService.addHero.and.returnValue(of({ id: 5, name: name, strength: 4 }));
      const inputElement = fixture.debugElement.query(By.css('input')).nativeElement;
      const addButton = fixture.debugElement.queryAll(By.css('button'))[0];

      // Simulate typing the name into the input box
      inputElement.value = name;
      addButton.triggerEventHandler('click', null);
      fixture.detectChanges();

      const heroText = fixture.debugElement.query(By.css('ul')).nativeElement.textContent;
      expect(heroText).toContain(name);
    });

    it('should have the correct route for the first hero', () => {
      mockHeroService.getHeroes.and.returnValue(of(HEROES));
      fixture.detectChanges();
      const heroComponents = fixture.debugElement.queryAll(By.directive(HeroComponent));

      let routerLink = heroComponents[0]
        .query(By.directive(RouterLinkDirectiveStub))
        .injector.get(RouterLinkDirectiveStub);

      heroComponents[0].query(By.css('a')).triggerEventHandler('click', null);

      expect(routerLink.navigatedTo).toBe('/detail/1');
    });
  });
});
