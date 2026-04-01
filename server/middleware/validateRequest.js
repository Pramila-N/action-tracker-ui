const formatZodError = (issues) => issues.map((issue) => ({
  path: issue.path.join('.'),
  message: issue.message,
}));

const validateRequest = (schemas) => (req, res, next) => {
  const targets = ['body', 'params', 'query'];

  for (const target of targets) {
    const schema = schemas[target];
    if (!schema) {
      continue;
    }

    const result = schema.safeParse(req[target]);
    if (!result.success) {
      return res.status(400).json({
        message: 'Validation failed.',
        errors: formatZodError(result.error.issues),
      });
    }

    req[target] = result.data;
  }

  return next();
};

module.exports = { validateRequest };
