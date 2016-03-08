import React from 'react';

const thankYou = 'Thank you for registering.  We are excited to send you your first newsletter shortly.';

export default React.createClass({
    displayName: 'Subscribe',

    propTypes: {
        text: React.PropTypes.string,
        label: React.PropTypes.string,
        disabled: React.PropTypes.bool
    },

    componentWillMount() {
        this.setState({
            text: this.props.text,
            label: this.props.label,
            disabled: this.props.disabled
        });
    },

    _onClick: function() {
        this.setState({
            text: thankYou,
            label: 'Thank You',
            disabled: true
        });
    },

    render: function render() {
        return React.createElement('div', null,
            React.createElement('p', null, this.state.text),
            React.createElement('input', {
                id: 'email',
                disabled: this.state.disabled
            }),
            React.createElement('button', {
                onClick: this._onClick,
                disabled: this.state.disabled
            }, this.state.label));
    }
});
