import { readFileSync } from 'node:fs'
import { strict as assert } from 'node:assert'
import { JSDOM } from 'jsdom'

const script = readFileSync(new URL('../public/legacy.js', import.meta.url), 'utf8')

function loadPage(name) {
  const html = readFileSync(new URL(`../legacy-html/${name}.html`, import.meta.url), 'utf8')
  const dom = new JSDOM(html, { runScripts: 'outside-only', url: `https://mental-alchemy.test/${name}` })
  dom.window.IntersectionObserver = class {
    observe(element) { element.classList.add('in-view') }
    unobserve() {}
  }
  dom.window.scrollTo = () => {}
  dom.window.HTMLElement.prototype.scrollIntoView = () => {}
  dom.window.eval(script)
  return dom
}

{
  const dom = loadPage('therapists')
  const document = dom.window.document
  const cards = [...document.querySelectorAll('.directory-card')]
  const filter = document.querySelector('.filter-pill[data-filter="anxiety"]')
  assert.ok(filter, 'Anxiety filter should exist')
  filter.click()
  assert.ok(cards.some(card => card.classList.contains('hidden-card')), 'Filtering should hide non-matching therapists')
  assert.match(document.querySelector('#filter-count').textContent, /Showing \d+ therapist/)
  dom.window.close()
}

{
  const dom = loadPage('contact')
  const document = dom.window.document
  const form = document.querySelector('#contact-form')
  form.dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }))
  assert.equal(document.querySelector('#form-success').hidden, false, 'Contact success feedback should appear')
  dom.window.close()
}

{
  const dom = loadPage('signup')
  const document = dom.window.document
  document.querySelector('#signup-password').value = 'Example123!'
  document.querySelector('#confirm-password').value = 'Different123!'
  document.querySelector('#signup-form').dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }))
  assert.equal(document.querySelector('#match-hint').hidden, false, 'Password mismatch feedback should appear')
  document.querySelector('#confirm-password').value = 'Example123!'
  document.querySelector('#signup-form').dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }))
  assert.equal(document.querySelector('#signup-success').hidden, false, 'Signup success feedback should appear')
  dom.window.close()
}

{
  const dom = loadPage('booking')
  const document = dom.window.document
  document.querySelector('.booking-therapist-card').click()
  document.querySelector('#to-step-2').click()
  assert.equal(document.querySelector('#step-2').hidden, false, 'Selecting a therapist should open availability')
  const availableTime = document.querySelector('.time-btn:not([disabled])')
  assert.ok(availableTime, 'At least one appointment time should be available')
  availableTime.click()
  document.querySelector('#to-step-3').click()
  assert.equal(document.querySelector('#step-3').hidden, false, 'Selecting a time should open confirmation')
  dom.window.close()
}

{
  const dom = loadPage('dashboard')
  const document = dom.window.document
  document.querySelector('.mood-btn[data-mood="Good"]').click()
  assert.equal(document.querySelector('#mood-response').hidden, false, 'Mood feedback should appear')
  assert.match(dom.window.localStorage.getItem('harborMoodEntries'), /Good/)
  dom.window.close()
}

console.log('Mental Alchemy interaction checks passed.')
