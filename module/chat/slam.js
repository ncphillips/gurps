'use strict'
import { ChatProcessors } from '../../module/chat.js'
import selectTarget from '../utilities/select-target.js'
import ChatProcessor from './chat-processor.js'
import { SlamCalculatorApp } from './slam-calculator-app.js'

/**
 * Handle the '/slam' command. Must have a selected actor.
 */
export default class SlamChatProcessor extends ChatProcessor {
  static initialize() {
    ChatProcessors.registerProcessor(new SlamChatProcessor())
  }

  constructor() {
    super()
  }

  help() {
    return '/slam'
  }

  matches(line) {
    return line.startsWith('/slam')
  }

  async process(line) {
    let actor = GURPS.LastActor
    if (!actor) {
      ui.notifications.warn(game.i18n.localize('GURPS.chatYouMustHaveACharacterSelected'))
      return
    }

    // see if there are any targets
    let targets = actor.getOwners().flatMap(u => [...u.targets])

    // try to find the attacker's token
    let attacker = actor.token || canvas.tokens.placeables.find(it => it.actor === actor)

    if (targets.length === 1) SlamCalculatorApp.process(attacker, [...targets][0])
    else if (targets.length > 1) selectTarget().then(target => SlamCalculatorApp.process(attacker, target))
    else SlamCalculatorApp.process(attacker, null)

    this.privateMessage('Opening Slam Calculator')
  }

  privateMessage(text) {
    this.priv(text)
  }
}
