# Machine Learning Workflows

## Steps

https://fek.io/blog/how-to-add-machine-learning-to-your-node-js-app/ \
Machine learning workflows can be broken down into a couple of steps. 

<br>

### 1. The first step is finding the best algorithm for building your model

For text classification I was looking for something that was pretty simple. Natural has a couple of different classifiers, I chose the BayesClassifier.

<br>

### 2. The next step is finding or defining data you can use to train your model

For my project I used previous headlines that I had already selected for subject areas that I found interesting.

This step is probably the most important. The more data you have, and the more accurate your data is, the better your model will perform at selecting the right classification.

<br>

### 3. After training your model, test how accurate your model is against actual data

<br>

### 4. The last step is deploying your model into an application.

Some ML frameworks allow for models to be updated after they have been created. This is nice because you can continue to iterate on your model to make it more accurate over time
