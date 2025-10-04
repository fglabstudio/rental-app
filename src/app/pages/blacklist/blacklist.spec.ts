import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Blacklist } from './blacklist';

describe('Blacklist', () => {
  let component: Blacklist;
  let fixture: ComponentFixture<Blacklist>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Blacklist]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Blacklist);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
