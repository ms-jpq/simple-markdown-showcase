from logging import StreamHandler, getLogger

log = getLogger()
log.addHandler(StreamHandler())
