const data = {
  inputs: [],
  outputs: [],
};

// Example input-output pairs
data.inputs.push(
  'Create a form page with two text inputs for "name" and "email"'
);
data.outputs.push(`import { Formik, Form, Field } from 'formik';

function FormPage() {
  return (
    <Formik
      initialValues={{ name: '', email: '' }}
      onSubmit={(values) => {
        //submit code here
      }}
    >
      {({ handleSubmit }) => (
        <Form onSubmit={handleSubmit}>
          <Field name="name" placeholder="Name" type="text" />
          <Field name="email" placeholder="Email" type="text" />
          <button type="submit">Submit</button>
        </Form>
      )}
    </Formik>
  );
}
`);

return data;
