/* Copyright 2024 Marimo. All rights reserved. */

import classnames from 'classnames';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: classnames.ArgumentArray) {
  return twMerge(classnames(inputs));
}
