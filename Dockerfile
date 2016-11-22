FROM nodesource/trusty:iojs

ADD . /signalhub
WORKDIR /signalhub

RUN \
  npm install && \
  npm link

CMD [ "signalhub", "listen", "-p", "8080" ]

EXPOSE 8080
