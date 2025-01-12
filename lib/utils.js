function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

module.exports = { cn }; 