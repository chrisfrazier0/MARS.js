<a name="readme-top"></a>

> [!CAUTION]
> This project is not activley maintained. Many libraries it uses are outdated.

# MARS.js

> Javascript MARS, Memory Array Redcode Simulator

[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

## About

[Core War][1] is a 1984 programming game created by D. G. Jones and A. K.
Dewdney in which two or more battle programs (called "warriors") compete for
control of a virtual computer. These battle programs are written in an abstract
assembly language called Redcode. At the beginning of a game, each warrior is
loaded into memory at a random location, after which each program executes one
instruction in turn. The goal of the game is to cause the threads of opposing
programs to terminate (which happens if they execute an invalid instruction),
leaving the victorious program in sole possession of the core.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## MARS.js Overview

- Demo available at: <https://gh.frazier.software/MARS.js/>
- Compatible with node and browsers
- Unopinionated, fast, bare-bones [ICWS'94][2] implementation.
- Includes support for the commonly used experimental opcodes `SEQ`, `SNE`, and
  `NOP` as well as A-field relative addressing modes `\*`, `{`, and `}`. (aka EXT94)
- Does not support P-Space extensions (`LDP`, `STP`, and `PIN`) or pMARS specific
  features such as `FOR/ROF` or `;assert`.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Installation

With [npm][3] installed, run

```shell
$ npm install --save git+https://github.com/chrisfrazier0/MARS.js.git#0.0.1
```

## Usage

```js
const mars = require('MARS.js')();
mars.load(/* ... */);
mars.stageAll();
mars.cycle();
console.log(mars.state);
```

#### MARS([opts])

Return a new MARS.js instance with the given `opts`. Valid keys for `opts` are:

- coreSize: _[Number]_ size of the core available at `state.core`
- minDistance _[Number]_ minimum distance to separate warriors during staging
- instructionLimit _[Number]_ maximum number of instructions per warrior
- threadLimit _[Number]_ maximum number of allowed threads per warrior

#### mars.clear()

Clears the current state and resets the array of loaded warriors.

#### mars.load([name], src)

Loads and compiles a warrior from a redcode source string.

- name: _[String]_ name of the warrior, if not provided the name will be parsed
  from the comments or default to `Nameless`
- src: _[String]_ redcode source of the warrior

#### mars.stage(warrior, [start])

Stages the specified warrior into the core at a given address. If no address is
specified then the warrior is staged at a random location.

- warrior: _[String/Number]_ name or id of the warrior to stage
- start: _[Number]_ address to stage the warrior

#### mars.stageAll()

Stage all of the currently loaded warriors.

#### mars.step()

Execute the next instruction and update the current `mars.state`.

#### mars.cycle()

Finish the current instruction cycle and return the cycle count.

#### state.clear()

Clear the core, dirty set, and associated `mars.state` data.

#### state.shuffle()

Randomize the execution order of the currently staged warriors.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Contributing

1. Fork it (<https://github.com/chrisfrazier0/MARS.js/fork>)
2. Create your feature branch (`git checkout -b feature/fooBar`)
3. Commit your changes (`git commit -am 'Add some fooBar'`)
4. Push to the branch (`git push origin feature/fooBar`)
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

<p align="right">(<a href="#readme-top">back to top</a>)</p>

[1]: https://en.wikipedia.org/wiki/Core_War
[2]: http://corewar.co.uk/standards/icws94.htm
[3]: https://npmjs.org/
[license-shield]: https://img.shields.io/github/license/chrisfrazier0/MARS.js.svg?style=for-the-badge
[license-url]: https://github.com/chrisfrazier0/MARS.js/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/chrisfrazier0
