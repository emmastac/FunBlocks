import classNames from 'classnames'
import React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { pushState, selectRule } from 'FunBlocks/Actions/IDE'
import { Expression, Rule } from 'FunBlocks/AST/Terms'
import Block from 'FunBlocks/Components/Block'
import RuleBlock from 'FunBlocks/Components/RuleBlock'
import { DebugContext } from 'FunBlocks/Reducers/Contexts/DebugContext'
import { RootState } from 'FunBlocks/Store'
import History from './History'

const styles = require('./Workspace.module')

type Props = DebugContext & {
  rules: Array<Rule>,
  pushState(state: Term): void,
  selectRule(ruleID: string): void,
}

class DebugWorkspace extends React.PureComponent<Props> {

  render() {
    // Create the representation of the currently selected computation state.
    const state = (this.props.historyIndex >= 0) && (
      <Block
        term={ this.props.history[this.props.historyIndex] }
        onClick={ this.didStateClick.bind(this) }
      />
    )

    // Create the representation of the program's rewriting rules.
    const rules = this.props.rules.map((rule) => {
      const className = classNames(styles.ruleContainer, {
        [styles.selected]: this.props.selectedRuleID === rule.id,
      })

      return (
        <div key={ rule.id } className={ className } onClick={ () => this.didRuleClick(rule) }>
          <span className={ styles.selectIcon }>
            <FontAwesomeIcon icon="play" />
          </span>
          <RuleBlock rule={ rule } />
        </div>
      )
    })

    return (
      <div className={ styles.workspace }>
        <History />
        <div className={ styles.programDebugger }>
          <div className={ styles.sectionHeading }>Program State</div>
          <div className={ styles.stateViewer }>
            { state }
          </div>
          <div className={ styles.sectionHeading }>Rules</div>
          <div className={ styles.rulesViewer }>
            { rules }
          </div>
        </div>
      </div>
    )
  }

  componentDidMount() {
    // Add a listener that catches keydown events on the ESC key, to unselect a rule.
    document.addEventListener('keydown', this.didKeydown)
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.didKeydown)
  }

  private readonly didKeydown = (e: KeyboardEvent) => {
    if (e.keyCode == 27 /* ESC */) {
      this.props.selectRule(null)
    }
  }

  private didStateClick(expr: Expression, startAnimation: (animation: string) => void) {
    // If a rule has been selected, we shall try to apply it on the clicked term to rewrite it.
    const selectedRuleID = this.props.selectedRuleID
    if (selectedRuleID !== null) {
      // Load the rule to apply.
      const rule = this.props.rules.find((r) => r.id == selectedRuleID)
      console.assert(rule !== undefined, `rule not found '${selectedRuleID}'`)

      // Check if the left part of the rule matches the selected term.
      const mapping = expr.match(rule.left)
      if (mapping === null) {
        startAnimation('shake')
        return
      }

      // Compute the substitution.
      const result = rule.right.reified(mapping)
      const successor = this.props.history[this.props.historyIndex]
        .substituting({ [expr.id]: result })
      this.props.pushState(successor)
    }
  }

  private didRuleClick(rule: Rule) {
    if (this.props.selectedRuleID !== rule.id) {
      this.props.selectRule(rule.id)
    } else {
      this.props.selectRule(null)
    }
  }

}

const mapStateToProps = (state: RootState) => ({
  ...(state.context as DebugContext),
  rules: state.program.rules,
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  pushState: (state: Term) => dispatch(pushState(state)),
  selectRule: (ruleID: string) => dispatch(selectRule(ruleID)),
})

export default connect(mapStateToProps, mapDispatchToProps)(DebugWorkspace)
