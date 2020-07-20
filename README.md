# RpnTex

**RpnTeX** is a tool for making easier to create **LaTeX** equations using **Reverse Polish Notation**. It also functions as an **RPN calculator** as it can perform numerical evaluation of the typed expressions.

You can access the tool using the following link: [RpnTeX](https://danisagan.github.io/RpnTex/)

## How to use it

You can type commands in the input text area (>>) and then hit ENTER. You can also type directly using the tool's keyboard (easier on mobile phones).

The expression at the top of the stack will be shown in LaTeX format in the equation area.

## Examples

Easy example: 1 + 2
```
1 2 +
```

You can evaluate the last expression by executing the *num* command:
```
1 2 + num
```

Pressing ENTER (or the *exe* button) when there are no commands in the input command area also performs a numerical evaluation of the value at the top of the stack.

One-letter commands are evaluated to a variable. For example, for writing the Pythagoras theorem: a² + b² = c²
```
a sq b sq + c sq =
```

Variables can have subscripts by adding an underscore:
```
p_0
```

You can use greek letters by using the greek keyboard from the application, or by using a constant from the *gr* namespace (for instante *gr.alpha*)
```
gr.alpha
```

Values can be stored in a variable. For that, prefix the variable name with *@*, and the value at the top of the stack will be stored with that name:
```
42 @meaning_of_life
```

For retrieving the value, just type the name of the variable without the *@* symbol:
```
meaning_of_life
```

You can store any kind of value, not only numerical values.
```
F G m_1 m_2 * r sq / * = @newton
```

For undoing the last operation, execute the *undo* command (or press the *undo* button).
```
undo
```

