/* eslint-env node, mocha */
import Subscribe from "../client-src/testComponent.jsx";
import React from "react";
import ReactTestUtils from "react-addons-test-utils";
import _ from "lodash";
import { assert } from "chai";

const paragraphText = "We appreciate your interest. Please enter your email in the box below, then submit the form, " +
  "and you will be subscribed to our newsletter.";

const thankYou = "Thank you for registering.  We are excited to send you your first newsletter shortly.";

describe("Test the Subscribe element", function () {
  let out;
  const shallow = ReactTestUtils.createRenderer();
  beforeEach(function () {
    const elm = React.createElement(Subscribe, {
      text: paragraphText,
      disabled: false,
      label: "Submit"
    });
    shallow.render(elm);
    out = shallow.getRenderOutput();
  });

  afterEach(function () {
    out = undefined;
  });

  it("Defaults correctly", function () {
    const paragraph = _.findWhere(out.props.children, {type: "p"}).props.children;
    assert.equal(paragraph, paragraph);

    const button = _.findWhere(out.props.children, {type: "button"}).props;
    assert.equal(false, button.disabled);
  });

  it("onClick updates elements", function () {
    const button1 = _.findWhere(out.props.children, {type: "button"});
    button1.props.onClick();
    out = shallow.getRenderOutput();

    const button2 = _.findWhere(out.props.children, {type: "button"});
    assert.equal(true, button2.props.disabled);

    const paragraph = _.findWhere(out.props.children, {type: "p"}).props.children;
    assert.equal(paragraph, thankYou);
  });
});
