# Simple Interactive Demos

Examples of using the Demo and Playground components.

<script setup>
import { buttonClickCode, contactFormCode } from './playground-codes'
</script>

## Demo Component

The Demo component is best for showing static examples with collapsible code:

<Demo title="Static Example">
  <div style="padding: 20px; text-align: center; border: 2px dashed #ccc; border-radius: 8px;">
    <h3 style="color: #2196F3;">Welcome to PrintChecks!</h3>
    <p>This is a simple static demo.</p>
    <p style="font-size: 0.9em; color: #666;">
      Click "Show Code" below to see the source.
    </p>
  </div>
</Demo>

## Playground Component

The Playground component is for interactive, editable examples:

<Playground :code="buttonClickCode" />

## Form Example

Here's an interactive form you can edit:

<Playground :code="contactFormCode" />

## Try Editing!

The beauty of the Playground is that you can edit the code on the left and see your changes update in real-time on the right. Try:

- Changing the button text
- Modifying the colors
- Adding new form fields
- Changing the behavior

All changes will be reflected immediately in the preview pane!
